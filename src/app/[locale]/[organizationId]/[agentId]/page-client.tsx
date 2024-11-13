"use client";

import dynamic from "next/dynamic";

import Spinner from "@/components/spinner";

const Chat = dynamic(() => import("./chat").then((mod) => mod.Chat), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
  ),
});

export default function PageClient() {
  return <Chat />;
}
