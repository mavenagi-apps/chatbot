import { zodResolver } from "@hookform/resolvers/zod";
import { createId } from "@paralleldrive/cuid2";
import { useMutation } from "@tanstack/react-query";
import { Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import { FeedbackType } from "mavenagi/api";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ButtonGroup } from "@/components/button-group";
import { Textarea } from "@/components/ui/textarea";
import { useMavenAGIClient } from "@/lib/client";

import Spinner from "./spinner";
import { Button } from "./ui/button";

type Props = {
  message: string;
  conversationId: string;
  conversationMessageId: string;
};

export default function FeedbackForm({
  message,
  conversationId,
  conversationMessageId,
}: Props) {
  const client = useMavenAGIClient();
  const t = useTranslations("chat.FeedbackForm");
  const [feedbackId] = React.useState(() => createId());

  const [feedbackType, setFeedbackType] = React.useState<
    typeof FeedbackType.ThumbsUp | typeof FeedbackType.ThumbsDown | undefined
  >();
  const [feedbackTextFormShown, setFeedbackTextFormShown] =
    React.useState<boolean>(false);

  const mutationFn = async (feedback: {
    type: typeof FeedbackType.ThumbsUp | typeof FeedbackType.ThumbsDown;
    text?: string;
  }) => {
    setFeedbackType(feedback.type);
    await client.conversation.createFeedback({
      conversationId: { referenceId: conversationId },
      conversationMessageId: { referenceId: conversationMessageId },
      feedbackId: { referenceId: feedbackId },
      type: feedback.type,
      text: feedback.text,
    });
  };

  const thumbsMutation = useMutation({
    mutationFn,
    onSuccess: () => {
      reset();
      setFeedbackTextFormShown(true);
    },
    onError: () => {
      setFeedbackType(undefined);
      setFeedbackTextFormShown(false);
    },
  });
  const feedbackTextMutation = useMutation({
    mutationFn,
    onSuccess: () => {
      setFeedbackTextFormShown(false);
    },
  });

  const schema = z.object({
    text: z.string().min(1),
  });
  const { reset, register, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const onSubmit = handleSubmit(async (data) => {
    toast.promise(
      feedbackTextMutation.mutateAsync({
        type: feedbackType!,
        text: data.text,
      }),
      {
        loading: "Submitting feedback...",
        success: "Thanks for your feedback!",
        error: "Error submitting feedback.",
      },
    );
  });

  const thumbsOnClick = async (
    type: typeof FeedbackType.ThumbsUp | typeof FeedbackType.ThumbsDown,
  ) => {
    if (feedbackType !== type) {
      setFeedbackTextFormShown(false);
      toast.promise(thumbsMutation.mutateAsync({ type }), {
        loading: "Submitting feedback...",
        error: "Error submitting feedback.",
      });
    }
  };

  const buttonsContainerRef = React.useRef<HTMLDivElement>(null);
  const thumbsUpRef = React.useRef<HTMLButtonElement>(null);
  const thumbsDownRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div>
      <div className="flex justify-end">
        <div
          className="relative flex flex-wrap justify-end gap-x-4 gap-y-2 text-gray-500"
          ref={buttonsContainerRef}
        >
          <ButtonGroup className="relative">
            <button
              type="button"
              ref={thumbsUpRef}
              {...(feedbackTextFormShown &&
              feedbackType === FeedbackType.ThumbsUp
                ? { "data-active": "" }
                : {})}
              onClick={() => thumbsOnClick(FeedbackType.ThumbsUp)}
            >
              <ThumbsUp className="size-4" xlinkTitle={t("thumbs_up")} />
            </button>
            <button
              type="button"
              ref={thumbsDownRef}
              {...(feedbackTextFormShown &&
              feedbackType === FeedbackType.ThumbsDown
                ? { "data-active": "" }
                : {})}
              onClick={() => thumbsOnClick(FeedbackType.ThumbsDown)}
            >
              <ThumbsDown className="size-4" xlinkTitle={t("thumbs_down")} />
            </button>
            {
              <button
                type="button"
                onClick={() => {
                  toast.promise(navigator.clipboard.writeText(message), {
                    success: t("copied_to_clipboard"),
                  });
                }}
              >
                <Copy className="size-4" xlinkTitle={t("copy_to_clipboard")} />
              </button>
            }
          </ButtonGroup>
        </div>
      </div>

      {feedbackTextFormShown && (
        <div className="relative mt-4 rounded-lg border border-gray-200 text-xs shadow-sm">
          <div
            className="absolute"
            style={{
              right:
                buttonsContainerRef.current !== null &&
                thumbsUpRef.current !== null &&
                thumbsDownRef.current !== null
                  ? buttonsContainerRef.current.offsetWidth +
                    4 -
                    (feedbackType === FeedbackType.ThumbsUp
                      ? thumbsUpRef.current.offsetLeft +
                        thumbsUpRef.current.offsetWidth / 2
                      : thumbsDownRef.current.offsetLeft +
                        thumbsDownRef.current.offsetWidth / 2)
                  : "-9999px",
              top: "-6px",
            }}
          >
            <div
              className="absolute border-b border-r border-gray-200 bg-white"
              style={{
                transform: "rotate(-135deg)",
                height: "11px",
                width: "11px",
              }}
            />
          </div>
          {feedbackTextFormShown && (
            <>
              <div className="rounded-t-lg border-b border-gray-200 px-3 py-2">
                <h3 className="font-semibold">{t("feedback_reason")}</h3>
              </div>
              <div className="px-3 py-2">
                <form onSubmit={onSubmit} className="grid gap-y-2">
                  <Textarea
                    className="text-xs"
                    placeholder={
                      feedbackType === FeedbackType.ThumbsDown
                        ? t("down_placeholder")
                        : t("up_placeholder")
                    }
                    disabled={feedbackTextMutation.isPending}
                    {...register("text")}
                  />
                  <div>
                    <Button
                      variant="secondary"
                      disabled={feedbackTextMutation.isPending}
                      type="submit"
                      className="float-right"
                    >
                      {feedbackTextMutation.isPending ? (
                        <Spinner className="size-4 text-[--brand-color]" />
                      ) : null}
                      {t("submit")}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
