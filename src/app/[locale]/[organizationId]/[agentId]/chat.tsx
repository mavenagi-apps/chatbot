"use client";

import { createId } from "@paralleldrive/cuid2";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useChat } from "ai/react";
import Color from "colorjs.io";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
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
    setInput,
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
  if (!appSettings.brandColor) {
    appSettings.brandColor = "#6C2BD9";
  }
  if (!appSettings.brandFontColor) {
    appSettings.brandFontColor = "#6C2BD9";
  }
  if (!appSettings.brandTitleColor) {
    appSettings.brandTitleColor = "#ffffff";
  }

  const brandColor = appSettings.brandColor
    ? new Color(appSettings.brandColor)
    : undefined;

  const followUpQuestions =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    messages[messages.length - 1].annotations &&
    (messages[messages.length - 1].annotations as MessageAnnotation[]).length >
      0 &&
    (messages[messages.length - 1].annotations as MessageAnnotation[])[
      (messages[messages.length - 1].annotations as MessageAnnotation[])
        .length - 1
    ]
      ? (messages[messages.length - 1].annotations as MessageAnnotation[])[
          (messages[messages.length - 1].annotations as MessageAnnotation[])
            .length - 1
        ].followupQuestions
      : [];

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
        <div className="text-md py-4 px-6 font-medium text-gray-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Logo" src={appSettings.logoUrl} className="h-7" />
        </div>
      </div>
      <div
        className="flex flex-1 flex-col overflow-y-auto p-2"
        style={{ scrollbarGutter: "stable both-edges", scrollbarWidth: "thin" }}
      >
        <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 mt-5 px-2 *:mt-4">
          <ChatBubble
            direction="full"
            className="bg-[#f2f4f5] p-5"
            style={{ marginTop: 0 }}
          >
            <div className="flex flex-col gap-3">
              <div className="mb-2 whitespace-pre-wrap">
                <ReactMarkdown linkTargetInNewTab>
                  {appSettings.welcomeMessage || t("default_welcome_message")}
                </ReactMarkdown>
              </div>
              {appSettings.popularQuestions
                .slice(0, 3)
                .map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    className="flex flex-row px-3 py-1 gap-2 items-center rounded-lg border border-[#DADEE3] bg-white/50 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    onClick={() => {
                      void append({
                        role: "user",
                        content: question,
                      });
                    }}
                  >
                    <ArrowRight className="size-4" />
                    {question}
                  </button>
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
              <Fragment key={index}>
                <ChatBubble direction="left" className="bg-[#f2f4f5] gap-0">
                  <div className="max-w-full">
                    <BotMessage message={value.content} />
                  </div>

                  {value.annotations &&
                    value.annotations.length > 0 &&
                    (
                      value.annotations[
                        value.annotations.length - 1
                      ] as MessageAnnotation
                    ).sources.length > 0 && (
                      <ul className="grid grid-cols-2 pb-5 px-5 gap-x-3 gap-y-2 text-xs">
                        {(
                          value.annotations[
                            value.annotations.length - 1
                          ] as MessageAnnotation
                        ).sources
                          .slice(0, 4)
                          .map((source, index) => (
                            <li
                              key={index}
                              className="inline-flex border rounded border-[#DADEE3] overflow-hidden"
                            >
                              <div className="px-2 py-1 bg-[#E8EAED]">
                                {index + 1}
                              </div>
                              <div className="flex-1 bg-white truncate px-2 py-1">
                                <a
                                  key={index}
                                  title={source.title || source.url}
                                  href={source.url}
                                  target="_blank"
                                  className="text-zinc-950 decoration-zinc-950/50 data-[hover]:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-[hover]:decoration-white"
                                >
                                  {source.title || source.url}
                                </a>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}

                  {value.annotations && value.annotations.length > 0 && (
                    <div style={{ borderBottom: "none" }}>
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
                    </div>
                  )}
                </ChatBubble>
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
                        <ChatBubble
                          direction="left"
                          key={index}
                          className="bg-[#f2f4f5] gap-0"
                          style={{ marginTop: "0.75rem" }}
                        >
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
                              className="space-y-4 p-5"
                            >
                              <h4 className="text-sm font-medium text-[#272C34]">
                                {action.formLabel}
                              </h4>
                              {action.fields.map((actionField) => (
                                <FormField
                                  key={actionField.id}
                                  control={form.control}
                                  name={actionField.id}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-sm font-medium text-[#414956]">
                                        {actionField.label}
                                      </FormLabel>
                                      <FormControl>
                                        <input
                                          className="bg-white w-full border border-[#DADEE3] rounded-lg px-4 py-2"
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
                              <Button className="w-full" type="submit">
                                {action.submitLabel}
                              </Button>
                            </form>
                          </Form>
                        </ChatBubble>
                      );
                    };

                    return <ActionForm key={action.id} />;
                  })}
              </Fragment>
            ),
          )}
          {isLoading && !isResponseAvailable && (
            <div className="my-5">
              <Spinner className="text-[--brand-color]" />
            </div>
          )}

          {!isLoading && followUpQuestions.length > 0 && (
            <ChatBubble
              direction="left"
              className="flex flex-col bg-[#f2f4f5] items-start p-5 gap-3"
            >
              <div className="text-[#637083]">Select a suggested followup</div>
              {followUpQuestions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex flex-row px-3 py-1 gap-2 items-center rounded-lg border border-[#DADEE3] bg-white/50 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  onClick={() => {
                    void append({
                      role: "user",
                      content: question,
                    });
                  }}
                >
                  <ArrowRight className="size-4" />
                  {question}
                </button>
              ))}
            </ChatBubble>
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
        setValue={setInput}
        onSubmit={handleSubmit}
        append={append}
        isLoading={isLoading}
        data-testid="chat-input"
      />
    </main>
  );
}
