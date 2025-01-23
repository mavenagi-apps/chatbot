"use client";

import { createId } from "@paralleldrive/cuid2";
import { useChat } from "ai/react";
import { ArrowRight } from "lucide-react";
import { BotChartResponse, ChartSpecSchema } from "mavenagi/api";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { BotMessage, RenderCharts } from "@/components/bot-message";
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

import logoLight from "./mavenagi_logo_light.svg";
import { getOrCreateUserId } from "@/lib/utils";

type MessageAnnotation = {
  conversationMessageId: string;
  followupQuestions: string[];
  sources: {
    title: string;
    url: string;
  }[];
  charts?: {
    label: string;
    specSchema: ChartSpecSchema;
    spec: string;
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

export function Chat({ appSettings }: { appSettings: AppSettings }) {
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();
  const t = useTranslations("chat.ChatPage");

  const amplitude = useAmplitude();
  useEffect(() => {
    amplitude.logEvent("chat-home-view", { organizationId, agentId });
  }, [amplitude, organizationId, agentId]);

  const tag = useSearchParams().get("tag");
  const [userId] = useState(getOrCreateUserId());
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
    <>
      <div className="border-b border-gray-300 bg-white">
        <div className="text-md py-4 px-6 font-medium text-gray-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="Logo" src={appSettings.logoUrl} className="h-7" />
        </div>
      </div>
      <div
        className="bg-[#f8f8f8] flex flex-1 flex-col overflow-y-auto p-2"
        style={{ scrollbarGutter: "stable both-edges", scrollbarWidth: "thin" }}
      >
        <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 mt-5 px-2 *:mt-4">
          <ChatBubble
            direction="full"
            className="bg-white p-4"
            style={{ marginTop: 0 }}
          >
            <div className="flex flex-col gap-4">
              <div className="whitespace-pre-wrap">
                <ReactMarkdown linkTargetInNewTab>
                  {appSettings.welcomeMessage &&
                  appSettings.welcomeMessage !== "NULL"
                    ? appSettings.welcomeMessage
                    : t("default_welcome_message")}
                </ReactMarkdown>
              </div>
              <div className="flex flex-col gap-2 items-start">
                {appSettings.popularQuestions
                  .slice(0, 3)
                  .map((question, index) => (
                    <button
                      key={index}
                      type="button"
                      className="underline flex flex-row text-gray-900 text-start"
                      onClick={() => {
                        void append({
                          role: "user",
                          content: question,
                        });
                      }}
                    >
                      {question}
                    </button>
                  ))}
              </div>
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
                <ChatBubble direction="left" className="bg-white gap-0">
                  <div className="max-w-full">
                    <BotMessage message={value.content} />
                  </div>

                  {value.annotations?.map((annotation, index) => {
                    if (
                      (annotation as MessageAnnotation).charts &&
                      (
                        (annotation as MessageAnnotation)
                          .charts as BotChartResponse[]
                      ).length > 0
                    ) {
                      console.log("rendering charts");
                      return (
                        <RenderCharts
                          key={index}
                          charts={
                            (annotation as MessageAnnotation)
                              .charts as BotChartResponse[]
                          }
                        />
                      );
                    }
                    return null;
                  })}

                  {value.annotations &&
                    value.annotations.length > 0 &&
                    (
                      value.annotations[
                        value.annotations.length - 1
                      ] as MessageAnnotation
                    ).sources.length > 0 && (
                      <div className="flex flex-col gap-2 p-3">
                        <div className="text-gray-500">
                          {t("related_links")}
                        </div>
                        <ul className="gap-2 flex flex-col">
                          {(
                            value.annotations[
                              value.annotations.length - 1
                            ] as MessageAnnotation
                          ).sources
                            .slice(0, 4)
                            .map((source, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-3"
                              >
                                <ArrowRight className="size-3.5" />
                                <div className="flex-1">
                                  <a
                                    key={index}
                                    title={source.title || source.url}
                                    href={source.url}
                                    target="_blank"
                                    className="text-zinc-950 underline decoration-zinc-950/50 data-[hover]:decoration-zinc-950"
                                  >
                                    {source.title || source.url}
                                  </a>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
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
                        userId={userId}
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
        onSubmit={(question) =>
          question
            ? void append({
                role: "user",
                content: question,
              })
            : handleSubmit()
        }
        append={append}
        isLoading={isLoading}
        data-testid="chat-input"
        followUpQuestions={!isLoading ? followUpQuestions : []}
      />
    </>
  );
}
