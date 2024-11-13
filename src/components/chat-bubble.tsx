import { forwardRef, type PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

type ChatBubbleProps = PropsWithChildren<{
  direction: "left" | "right" | "full";
  className?: string;
  textColor?: string;
}>;

export const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ children, direction, className, textColor }, ref) => {
    return (
      <div
        className={cn("mb-5 flex", direction === "right" && "justify-end")}
        ref={ref}
      >
        <div
          className={cn(
            "grid w-full gap-y-5 border border-gray-200 bg-white p-4 shadow-sm rounded-lg",
            direction === "right" && "ml-8 w-fit",
            direction === "left" && "mr-8",
            className,
          )}
          style={textColor ? { color: textColor } : {}}
        >
          {children}
        </div>
      </div>
    );
  },
);

ChatBubble.displayName = "ChatBubble";
