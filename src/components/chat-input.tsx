import { CreateMessage, Message } from "ai/react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FormEventHandler, InputHTMLAttributes } from "react";

export type ChatInputProps = {
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoading: boolean;
  followUpQuestions: string[];
  append: (
    message: Message | CreateMessage,
  ) => Promise<string | null | undefined>;
} & InputHTMLAttributes<HTMLInputElement>;

export const ChatInput = ({
  isLoading,
  onSubmit,
  followUpQuestions,
  append,
  ...props
}: ChatInputProps) => {
  const t = useTranslations("chat.ChatInput");
  const [seeMoreFollowupQuestions, setSeeMoreFollowupQuestions] =
    React.useState<boolean>(false);

  return (
    <div className="min-h-14 border-t border-gray-300 bg-white p-3">
      <div className="mx-auto">
        {!isLoading && followUpQuestions.length > 0 && (
          <div>
            {followUpQuestions
              .slice(0, seeMoreFollowupQuestions ? 3 : 1)
              .map((question, index) => (
                <div key={index} className="flex w-full flex-row">
                  <button
                    type="button"
                    className="mb-2 mr-2 flex flex-1 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    onClick={() => {
                      setSeeMoreFollowupQuestions(false);
                      void append({
                        role: "user",
                        content: question,
                      });
                    }}
                  >
                    <ArrowRight className="mr-2 h-4 w-4 block" />
                    {question}
                  </button>
                  {!seeMoreFollowupQuestions &&
                    followUpQuestions.length > 1 && (
                      <button
                        type="button"
                        className="mb-2 mr-2 flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => setSeeMoreFollowupQuestions(true)}
                      >
                        {t("see_more")}
                      </button>
                    )}
                </div>
              ))}
            {seeMoreFollowupQuestions && (
              <button
                type="button"
                className="mb-2 mr-2 items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                onClick={() => setSeeMoreFollowupQuestions(false)}
              >
                {t("see_less")}
              </button>
            )}
          </div>
        )}

        <form className="flex items-center" onSubmit={onSubmit}>
          <input
            aria-label="Question box"
            placeholder={t("question_placeholder")}
            className="w-0 grow resize-none border-0 p-2 text-xs outline-none focus:shadow-none focus:ring-0"
            {...props}
          />
          <button
            type="submit"
            aria-label="Submit question"
            disabled={isLoading}
            data-testid="submit-question"
            className="focus:ring-primary-300 flex h-7 w-7 items-center justify-center rounded-full bg-[--brand-color] bg-gradient-to-r text-xs font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
