import { MavenAGIClient } from "mavenagi";
import { fetcher } from "mavenagi/core";
import { z } from "zod";

import { getBaseUrl } from "@/lib/client.server";

export const maxDuration = 900;
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, conversationId, userId, organizationId, agentId, tag } = z
    .object({
      messages: z.array(
        z.object({
          content: z.string(),
          id: z.string(),
          toolInvocations: z
            .object({
              toolCallId: z.string(),
              args: z.record(z.string()),
            })
            .array()
            .optional(),
        }),
      ),
      conversationId: z.string(),
      userId: z.string(),
      organizationId: z.string(),
      agentId: z.string(),
      tag: z.string().optional().nullable(),
    })
    .parse(await req.json());

  const client = new MavenAGIClient({
    environment: getBaseUrl(),
    organizationId,
    agentId,
    fetcher: (args) =>
      fetcher({
        ...args,
        headers: {
          ...args.headers,
          "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
          "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
        },
      }),
  });

  if (tag && messages.length === 1) {
    await client.conversation.initialize({
      conversationId: { referenceId: conversationId },
      messages: [],
      tags: tag ? new Set([tag]) : undefined,
    });
  }
  const message = messages[messages.length - 1];

  if (message.toolInvocations) {
    const response = await client.conversation.submitActionForm(
      conversationId,
      {
        actionFormId: message.toolInvocations[0]!.toolCallId,
        parameters: message.toolInvocations[0]!.args,
      },
    );

    const responseMessage = response.messages[response.messages.length - 1];
    if (responseMessage.type !== "bot") {
      return new Response(`3:${JSON.stringify("Unknown error")}\n`, {
        headers: { "x-vercel-ai-data-stream": "v1" },
      });
    }
    let text = "";
    const actions = [];
    for (const response of responseMessage.responses) {
      if (response.type === "text") {
        text += response.text;
      } else {
        actions.push({
          fields: response.fields,
          formLabel: response.formLabel,
          id: response.id,
          submitLabel: response.submitLabel,
        });
      }
    }
    return new Response(
      `0:${JSON.stringify(text)}\n8:${JSON.stringify([
        {
          conversationMessageId: responseMessage.conversationMessageId,
          followupQuestions: responseMessage.metadata.followupQuestions,
          sources: responseMessage.metadata.sources,
          actions,
        },
      ])}`,
      {
        headers: { "x-vercel-ai-data-stream": "v1" },
      },
    );
  }

  const response = await client.conversation.askStream(conversationId, {
    userId: { referenceId: userId },
    conversationMessageId: {
      referenceId: message.id,
    },
    text: message.content,
  });

  const stream = new ReadableStream({
    async start(controller) {
      let conversationMessageId = undefined;
      let metadata = undefined;
      const actions = [];
      try {
        for await (const chunk of response) {
          if (chunk.eventType === "start") {
            conversationMessageId = chunk.conversationMessageId.referenceId;
          } else if (chunk.eventType === "text") {
            controller.enqueue(
              new TextEncoder().encode(`0:${JSON.stringify(chunk.contents)}\n`),
            );
          } else if (chunk.eventType === "action") {
            actions.push({
              fields: chunk.fields,
              formLabel: chunk.formLabel,
              id: chunk.id,
              submitLabel: chunk.submitLabel,
            });
          } else if (chunk.eventType === "metadata") {
            const newMetadata = JSON.stringify({
              followupQuestions: chunk.followupQuestions,
              sources: chunk.sources,
            });
            if (newMetadata !== metadata) {
              metadata = newMetadata;
              controller.enqueue(
                new TextEncoder().encode(
                  `8:${JSON.stringify([
                    {
                      conversationMessageId,
                      ...JSON.parse(newMetadata),
                    },
                  ])}\n`,
                ),
              );
            }
          }
        }
        if (actions.length > 0) {
          controller.enqueue(
            new TextEncoder().encode(
              `8:${JSON.stringify([
                {
                  conversationMessageId,
                  ...(metadata
                    ? JSON.parse(metadata)
                    : {
                        followupQuestions: [],
                        sources: [],
                      }),
                  actions,
                },
              ])}`,
            ),
          );
        }
        controller.close();
      } catch (err) {
        console.error("Stream error:", err);
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: { "x-vercel-ai-data-stream": "v1" },
  });
}
