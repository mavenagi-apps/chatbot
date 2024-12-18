import { CreateMessage, Message } from "ai/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React, {
  Dispatch,
  HTMLAttributes,
  InputHTMLAttributes,
  SetStateAction,
} from "react";

import { cn } from "@/lib/utils";

export type ChatInputProps = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onSubmit: (question?: string) => void;
  isLoading: boolean;
  append: (
    message: Message | CreateMessage,
  ) => Promise<string | null | undefined>;
  followUpQuestions: string[];
} & Omit<
  InputHTMLAttributes<HTMLDivElement>,
  "onChange" | "value" | "onSubmit"
>;

export const ChatInput = ({
  isLoading,
  onSubmit,
  append,
  value,
  setValue,
  followUpQuestions,
  ...props
}: ChatInputProps) => {
  const t = useTranslations("chat.ChatInput");
  const [seeMoreFollowupQuestions, setSeeMoreFollowupQuestions] =
    React.useState<boolean>(false);

  const FollowUpQuestionButton = ({
    className,
    children,
    ...props
  }: HTMLAttributes<HTMLButtonElement>) => (
    <button
      className={cn(
        className,
        "flex flex-1 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200",
      )}
      {...props}
      onClick={() => onSubmit(followUpQuestions[0])}
    >
      <ArrowRight className="size-4" />
      {children}
    </button>
  );

  return (
    <div className="px-4 pb-3 pt-3 gap-3 border-t flex flex-col">
      {followUpQuestions.length > 0 && (
        <div
          className={cn(
            "flex",
            seeMoreFollowupQuestions
              ? "flex-col gap-2 items-start"
              : "items-center gap-3",
          )}
        >
          <div className="flex flex-1 flex-col gap-2 self-stretch">
            {followUpQuestions
              .slice(0, !seeMoreFollowupQuestions ? 1 : undefined)
              .map((question, index) => (
                <FollowUpQuestionButton key={index}>
                  {question}
                </FollowUpQuestionButton>
              ))}
          </div>
          {followUpQuestions.length > 1 && (
            <button
              className="flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
              onClick={() => setSeeMoreFollowupQuestions((prev) => !prev)}
            >
              {seeMoreFollowupQuestions
                ? t("see_less")
                : t("see_more", {
                    count: followUpQuestions.length - 1,
                  })}
            </button>
          )}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex items-center"
      >
        <input
          suppressContentEditableWarning
          contentEditable="plaintext-only"
          aria-label="Question box"
          placeholder={t("question_placeholder")}
          className="break-all w-0 grow resize-none min-h-[18px] pr-[22px] py-2 text-xs/[18px] bg-white outline-none focus:shadow-none"
          onChange={(event) => {
            setValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          value={value}
          {...props}
        />
        <button
          type="submit"
          aria-label="Submit question"
          disabled={isLoading}
          data-testid="submit-question"
          className="p-2 focus:ring-primary-300 flex items-center justify-center rounded-full bg-[--brand-color] bg-gradient-to-r text-xs font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4"
        >
          <ArrowRight className="size-4" />
        </button>
      </form>
    </div>
  );
};
