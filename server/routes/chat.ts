import { Elysia, t } from "elysia";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const chat = new Elysia({ prefix: "/chat" })
  .post(
    "/",
    async ({ body }) => {
      const { messages } = body;

      const result = streamText({
        model: openai.responses("gpt-4o"),
        messages,
        tools: {
          web_search_preview: openai.tools.webSearchPreview(),
        },
      });

      return result.toDataStreamResponse();
    },
    {
      body: t.Object({
        messages: t.Array(t.Any()),
      }),
    }
  );
