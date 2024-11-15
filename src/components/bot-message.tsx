import React from "react";

import { ReactMarkdown } from "./react-markdown";

export interface BotMessageProps {
  message: string;
}

export function BotMessage({ message }: BotMessageProps) {
  return (
    <>
      <div className="prose max-w-full overflow-auto p-5">
        <ReactMarkdown bulletsInside={true} linkTargetInNewTab={true}>
          {message}
        </ReactMarkdown>
      </div>
    </>
  );
}
