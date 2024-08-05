import "dotenv/config";
import { env } from "node:process";
import { ModelmetryClient } from "../src/sdk";
import { asyncSleep } from "../src/utils/dates";

const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
const HOST = String(env.HOST); // e.g. https://api.modelmetry.com

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
  const TRACES_NUM = 8;
  for (let i = 0; i < TRACES_NUM; i++) {
    const trace = obs.newTrace("example")
    // loop to generate some spans, between 1 and 5
    for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
      const span = trace.newSpan("example-span");
      await asyncSleep(15);
      span.end();
    }
    trace.end();
    await asyncSleep(100);
    console.log(`[${i}/${TRACES_NUM}] Generated trace ${trace.getXid()}`);
  }

  await asyncSleep(1000);

  // flush observability data
  await obs.shutdown();

  console.log("Done!");
  return;
};

await example();
