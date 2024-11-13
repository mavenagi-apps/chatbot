import React from "react";

import { ReactMarkdown } from "./react-markdown";

export interface BotMessageProps {
  message: string;
}

export function BotMessage({ message }: BotMessageProps) {
  return (
    <>
      <div className="prose max-w-full overflow-auto text-xs">
        <ReactMarkdown linkTargetInNewTab={true}>{message}</ReactMarkdown>
      </div>
    </>
  );
}
