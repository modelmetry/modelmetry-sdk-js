import "dotenv/config";
import Fastify from "fastify";
import { env } from "node:process";
import OpenAI from "openai";
import { ModelmetryClient } from "../src/sdk";
import type { Span } from "../src/signals";
import { asyncSleep } from "../src/utils/dates";
import { fromOpenaiMessages } from "../src/providers/openai/index";

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

    // when using startSpan, a failing operation will throw its original error
    // and mark the span as errored (severity = `error`)
    if (Math.random() > 0.95) {
        await operationThatWillFail(rootSpan);
    }

    // now let's look at more normal operations
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

const operationThatWillFail = async (parentSpan: Span) => {
    return parentSpan.startSpan("operation-that-will-fail", "other", async (span) => {
        await asyncSleep(Math.floor(Math.random() * 87 + 12));
        throw new Error("This operation failed, as expected for this example.");
    });
}

const selectRandomTopic = async (parentSpan: Span) => {
    return parentSpan.startSpan("pick-topic", "other", async (span) => {
        const topics = await loadTopics(span);
        const selected = await randomTopic(topics, span);
        span.end();
        return selected;
    });
};

const loadTopics = async (parentSpan: Span) => {
    return parentSpan.startSpan("load-topics", "retrieval", async (span) => {
        const topics = ["artificial intelligence", "typescript", "statistics", "python", "generative ai", "o11y observability"];
        await asyncSleep(Math.floor(Math.random() * 87) + 12);
        span.addQuery({
            TextRepresentation: "List of topics",
            Embeddings: [0.010011, 0.5242323, 0.123131, 0.934242423, 0.12312312, 0.7382137],
        })
        for (const topic of topics) {
            span.addDocument({ Title: topic, ContentType: 'text', Identifier: topic, });
        }
        return topics;
    })
};

const randomTopic = async (topics: string[], parentSpan: Span) => {
    return parentSpan.startSpan("random-selection", "other", async (span) => {
        span.setMetadata("email", "someone@example.com");
        await asyncSleep(Math.floor(Math.random() * 87) + 12);
        return topics[Math.floor(Math.random() * topics.length)];
    })
};

const generateJoke = async (topic: string, parentSpan: Span) => {
    // start the new span manually (without startSpan()), which means we need to handle failures and ending ourselves
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
    span.setProvider("openai");
    span.setModel(model);
    span.setOption("MaxTokens", 500);
    span.setCompletionMessages(fromOpenaiMessages(messages))
    span.addDocument({ Title: topic, ContentType: 'text', Identifier: topic, });

    try {
        const jokeResponse = await openai.chat.completions.create({ max_tokens: 500, model, messages });
        const joke = jokeResponse.choices[0].message.content;

        // end the span with the output
        span.setUsage("input", jokeResponse.usage?.prompt_tokens || 0);
        span.setUsage("output", jokeResponse.usage?.completion_tokens || 0);
        span.setUsage("total", jokeResponse.usage?.total_tokens || 0);

        span.setMetadata("joke", joke);
        span.setMetadata("len", joke?.length || 0);

        span.setModelOutputText(String(joke));
        span.end();

        return joke;
    } catch (error) {
        // end the span with the error :(
        span.errored(error);
        throw error;
    }
};

// Run the server!
try {
    console.log("Get a joke at: ", "http://127.0.0.1:3000/joke");
    await fastify.listen({ port: 3000 });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
