import { type NextRequest } from "next/server";

import { getBaseUrl } from "@/lib/client.server";

const handleRequest = async (
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) => {
  const headers = new Headers(req.headers);
  if (process.env.CF_ACCESS_CLIENT_ID) {
    headers.set("CF-Access-Client-Id", process.env.CF_ACCESS_CLIENT_ID);
  }
  if (process.env.CF_ACCESS_CLIENT_SECRET) {
    headers.set("CF-Access-Client-Secret", process.env.CF_ACCESS_CLIENT_SECRET);
  }
  headers.set(
    "Authorization",
    `Basic ${Buffer.from(
      `${process.env.MAVENAGI_APP_ID}:${process.env.MAVENAGI_APP_SECRET}`,
    ).toString("base64")}`,
  );
  const path = (await params).path.map(encodeURIComponent).join("/");

  const response = await fetch(
    new Request(`${getBaseUrl()}/${path}${req.nextUrl.search}`, {
      method: req.method,
      headers,
      body: req.body,
      redirect: "manual",
      // @ts-expect-error error
      duplex: "half",
    }),
  );
  const responseHeaders = new Headers();
  for (const key of ["content-type"]) {
    if (response.headers.get(key)) {
      responseHeaders.set(key, response.headers.get(key)!);
    }
  }
  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const HEAD = handleRequest;
export const PATCH = handleRequest;
