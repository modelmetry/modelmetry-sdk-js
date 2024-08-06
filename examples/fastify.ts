import "dotenv/config";
import Fastify from "fastify";
import { env } from "node:process";
import OpenAI from "openai";
import { newMessagesFromOpenai, newTextOutput } from "../src/openapi";
import type { Span } from "../src/signals";
import { ModelmetryClient } from "../src/sdk";
import { asyncSleep } from "../src/utils/dates";

// Instantiate the Modelmetry client
const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
const HOST = String(env.HOST); // e.g. https://api.modelmetry.com
const modelmetry = new ModelmetryClient({
  tenantId: TENANT_ID,
  apikey: API_KEY,
  baseUrl: HOST,
  observability: {
    intervalMs: 100, // check every 100ms for traces to flush, you would normally set this to ~5000ms
    maxBatchLen: 1, // send traces immediately
    onFlushed: (traces) => {
      console.log(
        `onFlushed: ${traces.length} traces flushed: ${traces.map((t) => t.getXid())}`,
      );
    },
  },
});

// Instantiate the OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY, // This is the default and can be omitted
});

// Instantiate fastify
const fastify = Fastify({
  logger: true,
});

fastify.get("/joke", async function handler(request, reply) {
  const trace = modelmetry.observability().newTrace("get-joke");
  const rootSpan = trace.span("root", "other", {});

  try {
    const randomTopic = await selectRandomTopic(rootSpan);
    const joke = await generateJoke(randomTopic, rootSpan);
    reply.send({ topic: randomTopic, joke });
  } catch (err) {
    rootSpan.errored(err);
    reply
      .status(500)
      .send({ error: "Failed to fetch joke", message: err.message });
  } finally {
    rootSpan.end();
    trace.end();
  }
});

const loadTopics = async (parentSpan: Span) => {
  return parentSpan.startSpan("load-topics", "retrieval", async (span) => {
    const topics = ["artificial intelligence", "typescript", "statistics"];
    await asyncSleep(Math.floor(Math.random() * 87) + 12);
    return topics;
  })
};

const randomTopic = async (topics: string[], parentSpan: Span) => {
  return parentSpan.startSpan("random-selection", "other", async (span) => {
    span.setAttribute("email", "someone@example.com");
    await asyncSleep(Math.floor(Math.random() * 87) + 12);
    return topics[Math.floor(Math.random() * topics.length)];
  })
};

const selectRandomTopic = async (parentSpan: Span) => {
  return parentSpan.startSpan("pick-topic", "other", async (span) => {
    const topics = await loadTopics(span);
    const selected = await randomTopic(topics, span);
    span.end();
    return selected;
  });
};

const generateJoke = async (topic: string, parentSpan: Span) => {
  // start the new span
  const span = parentSpan.span("generate-joke", "completion", {});
  const model = "gpt-4o-mini";
  const messages: Array<OpenAI.Chat.ChatCompletionMessageParam> = [
    {
      role: "system",
      content: "You are a witty stand-up comedian in a writing room.",
    },
    {
      role: "user",
      content: `Tell me a short and funny joke about ${topic}.`,
    },
  ];

  // add the input to the span, as well as the model and the options used
  span.familyData.Model = model;
  span.familyData.Options = { MaxTokens: 500 };
  span.familyData.Input = {
    Chat: {
      Messages: newMessagesFromOpenai(messages),
      Settings: { MaxTokens: 500 },
    },
  }

  try {
    const jokeResponse = await openai.chat.completions.create({ max_tokens: 500, model, messages });
    const joke = jokeResponse.choices[0].message.content;

    // end the span with the output
    span.end({ Output: { Text: newTextOutput(String(jokeResponse.choices[0].message.content)) } });

    return joke;
  } catch (error) {
    // end the span with the error :(
    span.errored(error);
    throw error;
  }
};

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
