import "dotenv/config";
import { env } from "node:process";
import { ModelmetryClient } from "../src/sdk";
import { asyncSleep } from "../src/utils/dates";

const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
const HOST = String(env.HOST); // e.g. https://api.modelmetry.com

const FAKE_METRICS = ["accuracy", "precision", "recall", "f1"];
const TRACE_NAMES = ["hr.chatbot.turn", "support.chatbot.turn", "support.ticket.reply"];

const modelmetry = new ModelmetryClient({
  tenantId: TENANT_ID,
  apikey: API_KEY,
  baseUrl: HOST,
  observability: {
    intervalMs: 200,
    maxBatchLen: 2,
    onFlushed: (traces) => {
      console.log(`onFlushed: ${traces.length} traces flushed: ${traces.map((t) => t.getXid())}`);
    }
  },
});

const obs = modelmetry.observability();

export const example = async () => {

  // loop to generate some observability data
  const TRACES_NUM = 20;
  for (let i = 0; i < TRACES_NUM; i++) {
    const traceName = TRACE_NAMES[Math.floor(Math.random() * TRACE_NAMES.length)];
    const trace = obs.newTrace(traceName)

    // loop to generate some spans
    // spans between 1 and 12
    const SPAN_NUM = Math.floor(Math.random() * 12) + 1;
    for (let j = 0; j < SPAN_NUM; j++) {
      const span = trace.span("example-span", "other", {});

      if (Math.random() > 0.5) {
        span.newEvent("something happened in span");
      }

      if (Math.random() > 0.5) {
        span.newFinding(
          FAKE_METRICS[Math.floor(Math.random() * FAKE_METRICS.length)],
          Math.random(),
        );
      }

      await asyncSleep(10);
      span.end();
    }
    trace.end();
    await asyncSleep(60);
    console.log(`[${i}/${TRACES_NUM}] Generated trace ${trace.getXid()}`);
  }

  await asyncSleep(500);

  // flush observability data
  await obs.shutdown();

  console.log("Done!");
  return;
};

await example();
