import "dotenv/config";
import { env } from "node:process";
import { ModelmetryClient } from "../src/sdk";
import { asyncSleep } from "../src/utils/dates";

export const example = async () => {
  const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
  const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
  const HOST = String(env.HOST); // e.g. https://api.modelmetry.com

  const modelmetry = new ModelmetryClient({
    tenantId: TENANT_ID,
    apikey: API_KEY,
    baseUrl: HOST,
  });

  const obs = modelmetry.observability();
  const trace = obs.newTrace("root");

  const span1 = trace.newSpan("root.span1");
  span1.newEvent("something happened in span1");

  await asyncSleep(50);

  const span1_1 = span1.newEmbeddingsSpan("root.span1.1");
  await asyncSleep(50);

  span1_1.end([[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14]]);
  span1.end();

  const span2 = trace.newSpan("root.span2");
  span2.newEvent("something happened in span2");
  span2.newEvent("something happened again in span2");
  await asyncSleep(50);

  const span2_1 = span2.newSpan("root.span2.1");
  span2_1.newEvent("something happened in span2.1");
  await asyncSleep(50);

  const span2_2 = span2.newCompletionSpan("root.span2.2");
  span2_2.newEvent("something happened in span2.2");
  span2_2.newEvent("something happened again in span2.2");
  await asyncSleep(50);
  span2_1.errored(new Error("Something went wrong in span2.1"));

  await asyncSleep(50);
  span2_2.end({
    Input: {
      Text: {
        Text: "Hello, world!",
      },
    },
    Output: {
      Text: {
        Text: "Oh hey, let me know if there's anything I can help with!",
      },
    },
    Model: "openai/gpt-4o-mini",
  });
  span2.end();

  await asyncSleep(50);

  trace.end();

  await obs.flushAll()
};

await example();