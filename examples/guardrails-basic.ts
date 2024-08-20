import { ModelmetryClient } from "../src/sdk"
import { env } from "node:process";
import 'dotenv/config'


export const basicGuardrailExample = async () => {

  const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
  const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
  const HOST = String(env.HOST); // e.g. https://api.modelmetry.com

  const modelmetry = new ModelmetryClient({
    tenantId: TENANT_ID,
    apikey: API_KEY,
    baseUrl: HOST,
  })

  const result = await modelmetry.guardrails().check({
    Input: {
      Text: "Can you please let me know what the employee handbook say about vacation time during a busy period?",
    },
  }, "grd_jaohzgcbd5hbt1grwmvp")

  console.log(JSON.stringify(result, null, 2))

  if (result.failed) {
    // Handle a failed check
    console.error("Failed check", result)
  }

  if (result.errored) {
    // Handle an errored check (an error means an unexpected error occurred, not that the check failed).
    // By default, an error results in a "passed" check with this errored property set to true.
    console.warn("Errored check", result)
  }

  // The check passed, carry on
  console.info("Passed check", result)
}

await basicGuardrailExample();