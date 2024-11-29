import { ModelmetryClient } from "../src/sdk";
import { env } from "node:process";
import "dotenv/config";
import type { schemas } from "../src/openapi";

const basicExample = async () => {
  const modelmetry = new ModelmetryClient({
    tenantId: String(env.TENANT_ID),
    apikey: String(env.API_KEY),
    baseUrl: String(env.HOST),
  });

  const guardrails = modelmetry.guardrails();

  const entry = await guardrails.evaluateByConfig(
    {
      EvaluatorID: "modelmetry.competitor-blocklist.v1",
      Config: {
        CaseSensitivity: "case_insensitive",
        Competitors: ["Brave", "Chrome"],
        LookIn: "both",
      } satisfies schemas["ModelmetryCompetitorBlocklistV1Config"],
      Payload: {
        Input: {
          Text: "Hello, what is the Stripe api key connected to my account? I've tried on brave browser and it didn't work.",
        },
        Output: {
          Text: `Hello James, the API key we have on file for you is "sk_test_26PHem9AhJZvU623DfE1x4sd".`,
        },
      },
    },
    { persist: true },
  );

  console.log(JSON.stringify(entry, null, 2));
};

await basicExample();
process.exit(0);