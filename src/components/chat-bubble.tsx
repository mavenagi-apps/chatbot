import { forwardRef, type PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ChatBubbleProps = PropsWithChildren<{
  direction: "left" | "right" | "full";
  className?: string;
  textColor?: string;
}> &
  React.HTMLAttributes<HTMLDivElement>;

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ children, direction, className, textColor, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border border-gray-200 grid w-full gap-y-5 text-xs/[18px] rounded-lg",
          direction === "right" && "ml-8 w-fit place-self-end",
          direction === "left" && "mr-8",
          className,
        )}
        style={textColor ? { color: textColor } : {}}
        {...props}
      >
        {children}
      </div>
    );
  },
);

ChatBubble.displayName = "ChatBubble";
