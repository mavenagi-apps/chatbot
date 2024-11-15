import React from "react";

import { ReactMarkdown } from "@/components/react-markdown";

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="p-5">
      <ReactMarkdown linkTargetInNewTab={true}>{text}</ReactMarkdown>
    </div>
  );
}
