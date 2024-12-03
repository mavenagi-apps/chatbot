import React from "react";

import { ReactMarkdown } from "@/components/react-markdown";

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="px-4 py-3">
      <ReactMarkdown linkTargetInNewTab={true}>{text}</ReactMarkdown>
    </div>
  );
}
