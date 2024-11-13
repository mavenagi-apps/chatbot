"use client";

import { createId } from "@paralleldrive/cuid2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useChat } from "ai/react";
import Color from "colorjs.io";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { BotMessage } from "@/components/bot-message";
import { ChatBubble } from "@/components/chat-bubble";
import { ChatInput } from "@/components/chat-input";
import FeedbackForm from "@/components/feedback-form";
import { ReactMarkdown } from "@/components/react-markdown";
import Spinner from "@/components/spinner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UserMessage } from "@/components/user-message";
import { useAmplitude } from "@/lib/amplitude-provider";
import { useMavenAGIClient } from "@/lib/client";

import logoLight from "./mavenagi_logo_light.svg";

type MessageAnnotation = {
  conversationMessageId: string;
  followupQuestions: string[];
  sources: {
    title: string;
    url: string;
  }[];
  actions?: {
    fields: {
      id: string;
      label: string;
      description: string;
      required: boolean;
      suggestion?: string;
    }[];
    formLabel: string;
    id: string;
    submitLabel: string;
  }[];
};

export function Chat() {
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();
  const t = useTranslations("chat.ChatPage");
  const client = useMavenAGIClient();

  const amplitude = useAmplitude();
  useEffect(() => {
    amplitude.logEvent("chat-home-view", { organizationId, agentId });
  }, [amplitude, organizationId, agentId]);

  const appSettings = useSuspenseQuery({
    queryKey: ["appSettings"],
    queryFn: async () =>
      client.appSettings.get() as unknown as Promise<AppSettings>,
  }).data;

  const tag = useSearchParams().get("tag");
  const [userId] = useState(createId());
  const [conversationId] = useState(createId());
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: _handleSubmit,
    isLoading,
    append: _append,
  } = useChat({
    body: { conversationId, userId, organizationId, agentId, tag },
    generateId: createId,
    sendExtraMessageFields: true,
  });
  const preAsk = () => {
    amplitude.logEvent("chat-ask-click", {
      organizationId,
      agentId,
      conversationId,
      userId,
    });
    setTimeout(
      () =>
        latestQuestionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        }),
      0,
    );
  };
  const handleSubmit: typeof _handleSubmit = (message) => {
    preAsk();
    return _handleSubmit(message);
  };
  const append: typeof _append = (message) => {
    preAsk();
    return _append(message);
  };

  const isResponseAvailable =
    messages.length > 0 && messages[messages.length - 1].role === "assistant";

  const latestQuestionRef = useRef<HTMLDivElement>(null);
  const brandColor = appSettings.brandColor
    ? new Color(appSettings.brandColor)
    : undefined;

  return (
    <main
      className="flex h-screen flex-col"
      style={{
        // @ts-expect-error error
        "--brand-color": appSettings.brandColor,
        "--brand-font-color":
          appSettings.brandFontColor || appSettings.brandColor,
        "--brand-title-color": appSettings.brandTitleColor,
        ...(brandColor && {
          "--primary": `${brandColor.hsl[0]} ${brandColor.hsl[1]}% ${brandColor.hsl[2]}%`,
        }),
      }}
    >
      <div className="border-b border-gray-300 bg-white">
        <div className="text-md p-5 font-medium text-gray-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Logo" src={appSettings.logoUrl} className="h-7" />
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-auto text-xs">
        <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 mt-5 px-5">
          <ChatBubble direction="full">
            <div className="flex flex-col">
              <div className="mb-2 whitespace-pre-wrap">
                <ReactMarkdown linkTargetInNewTab>
                  {appSettings.welcomeMessage || t("default_welcome_message")}
                </ReactMarkdown>
              </div>
              {appSettings.popularQuestions
                .slice(0, 3)
                .map((question, index) => (
                  <div
                    className="my-1 cursor-pointer underline"
                    key={index}
                    onClick={() => append({ role: "user", content: question })}
                  >
                    {question}
                  </div>
                ))}
            </div>
          </ChatBubble>

          {messages.map((value, index) =>
            value.role === "user" ? (
              <ChatBubble
                direction="right"
                className="bg-[--brand-color]"
                textColor={appSettings.brandTitleColor}
                key={index}
                ref={index === messages.length - 1 ? latestQuestionRef : null}
              >
                <UserMessage text={value.content} />
              </ChatBubble>
            ) : (
              <ChatBubble direction="left" key={index}>
                <div className="max-w-full">
                  <BotMessage message={value.content} />
                </div>

                {value.annotations &&
                  value.annotations.length > 0 &&
                  (
                    value.annotations[
                      value.annotations.length - 1
                    ] as MessageAnnotation
                  ).actions?.map((action) => {
                    const ActionForm = () => {
                      const form = useForm({
                        defaultValues: Object.fromEntries(
                          action.fields.map((field) => [
                            field.id,
                            field.suggestion ?? "",
                          ]),
                        ),
                      });

                      return (
                        <Form {...form}>
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              append({
                                role: "user",
                                content: action.fields
                                  .map(
                                    (field) =>
                                      `${field.label}: ${form.getValues(field.id)}`,
                                  )
                                  .join("\n"),
                                toolInvocations: [
                                  {
                                    state: "call",
                                    toolCallId: action.id,
                                    toolName: action.id,
                                    args: form.getValues(),
                                  },
                                ],
                              });
                            }}
                            className="space-y-8"
                          >
                            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
                              {action.formLabel}
                            </h4>
                            {action.fields.map((actionField) => (
                              <FormField
                                key={actionField.id}
                                control={form.control}
                                name={actionField.id}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{actionField.label}</FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        required={actionField.required}
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      {actionField.description}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            ))}
                            <Button type="submit">{action.submitLabel}</Button>
                          </form>
                        </Form>
                      );
                    };

                    return <ActionForm key={action.id} />;
                  })}

                {value.annotations &&
                  value.annotations.length > 0 &&
                  (
                    value.annotations[
                      value.annotations.length - 1
                    ] as MessageAnnotation
                  ).sources.length > 0 && (
                    <div className="flex flex-col">
                      <div className="text-gray-500">{t("related_links")}</div>
                      <ul className="mt-2 space-y-2">
                        {(
                          value.annotations[
                            value.annotations.length - 1
                          ] as MessageAnnotation
                        ).sources.map((source, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-3"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                            <span className="flex-1">
                              <a
                                key={index}
                                href={source.url}
                                target="_blank"
                                className="text-zinc-950 underline decoration-zinc-950/50 data-[hover]:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-[hover]:decoration-white"
                              >
                                {source.title || source.url}
                              </a>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {value.annotations && value.annotations.length > 0 && (
                  <FeedbackForm
                    conversationId={conversationId}
                    conversationMessageId={
                      (
                        value.annotations[
                          value.annotations.length - 1
                        ] as MessageAnnotation
                      ).conversationMessageId
                    }
                    message={value.content}
                  />
                )}
              </ChatBubble>
            ),
          )}
          {isLoading && !isResponseAvailable && (
            <div className="my-5">
              <Spinner className="text-[--brand-color]" />
            </div>
          )}
        </div>
        {messages.length === 0 && !isLoading && (
          <div className="flex h-20 w-full items-center text-center">
            <div className="mx-auto flex items-center text-xs text-gray-400">
              {t("powered_by")}{" "}
              <a href="https://www.mavenagi.com" target="_blank">
                <Image
                  alt="Maven AGI"
                  src={logoLight}
                  className="ml-1 h-6"
                  width={82}
                  height={24}
                />
              </a>
            </div>
          </div>
        )}
      </div>
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        append={append}
        isLoading={isLoading}
        followUpQuestions={
          messages.length > 0 &&
          messages[messages.length - 1].role === "assistant" &&
          messages[messages.length - 1].annotations &&
          (messages[messages.length - 1].annotations as MessageAnnotation[])
            .length > 0 &&
          (messages[messages.length - 1].annotations as MessageAnnotation[])[
            (messages[messages.length - 1].annotations as MessageAnnotation[])
              .length - 1
          ]
            ? (
                messages[messages.length - 1].annotations as MessageAnnotation[]
              )[
                (
                  messages[messages.length - 1]
                    .annotations as MessageAnnotation[]
                ).length - 1
              ].followupQuestions
            : []
        }
        data-testid="chat-input"
      />
    </main>
  );
}
