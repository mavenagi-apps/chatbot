import React from "react";

import { ReactMarkdown } from "@/components/react-markdown";

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="text-xs">
      <ReactMarkdown linkTargetInNewTab={true}>{text}</ReactMarkdown>
    </div>
  );
}
