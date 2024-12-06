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

  const thumbsUpRef = React.useRef<HTMLButtonElement>(null);
  const thumbsDownRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="p-3 flex flex-col">
      <div className="flex self-end">
        <div className="rounded-lg border border-[#e5e7eb] relative flex items-center *:px-3 *:py-2 divide-x hover:*:bg-gray-200 outline-none overflow-hidden">
          <button
            type="button"
            ref={thumbsUpRef}
            {...(feedbackTextFormShown && feedbackType === FeedbackType.ThumbsUp
              ? { "data-active": "" }
              : {})}
            onClick={() => thumbsOnClick(FeedbackType.ThumbsUp)}
          >
            <ThumbsUp className="size-3" xlinkTitle={t("thumbs_up")} />
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
            <ThumbsDown className="size-3" xlinkTitle={t("thumbs_down")} />
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
              <Copy className="size-3" xlinkTitle={t("copy_to_clipboard")} />
            </button>
          }
        </div>
      </div>

      {feedbackTextFormShown && (
        <div className="relative mb-2 mt-1 rounded-lg border bg-white border-gray-200 text-xs shadow-sm">
          {feedbackTextFormShown && (
            <>
              <div className="rounded-t-lg border-b border-gray-200 px-3 py-3">
                <h3 className="font-semibold">{t("feedback_reason")}</h3>
              </div>
              <div className="px-3 py-3">
                <form onSubmit={onSubmit} className="grid gap-y-3">
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
                      size="sm"
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
