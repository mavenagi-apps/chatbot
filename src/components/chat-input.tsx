import { CreateMessage, Message } from "ai/react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import React, {
  Dispatch,
  FormEventHandler,
  InputHTMLAttributes,
  SetStateAction,
  useEffect,
  useRef,
} from "react";

export type ChatInputProps = {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoading: boolean;
  append: (
    message: Message | CreateMessage,
  ) => Promise<string | null | undefined>;
} & Omit<InputHTMLAttributes<HTMLDivElement>, "onChange" | "value">;

export const ChatInput = ({
  isLoading,
  onSubmit,
  append,
  value,
  setValue,
  ...props
}: ChatInputProps) => {
  const t = useTranslations("chat.ChatInput");

  const contentEditableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentEditableRef.current!.textContent !== value) {
      contentEditableRef.current!.textContent = value;
    }
  });

  return (
    <div className="px-6 pb-6">
      <form onSubmit={onSubmit} className="relative">
        <div
          ref={contentEditableRef}
          suppressContentEditableWarning
          contentEditable="plaintext-only"
          aria-label="Question box"
          placeholder={t("question_placeholder")}
          className="break-all w-full min-h-[56px] gap-2 pl-4 pr-[56px] py-4 text-sm rounded-lg border border-[#DADEE3] bg-white shadow-md outline-none focus:shadow-none focus:ring-primary-300 focus:ring-4"
          onInput={(event) => {
            // @ts-expect-error error
            setValue(event.target.textContent);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit(event);
            }
          }}
          {...props}
        />
        <button
          type="submit"
          aria-label="Submit question"
          disabled={isLoading}
          data-testid="submit-question"
          className="absolute right-4 bottom-3 p-2 focus:ring-primary-300 flex items-center justify-center rounded-lg bg-[--brand-color] bg-gradient-to-r text-xs font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
};
