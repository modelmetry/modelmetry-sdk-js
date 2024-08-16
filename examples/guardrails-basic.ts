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

  const result = await modelmetry.guardrails().check("grd_jaohzgcbd5hbt1grwmvp", {
    Input: {
      Text: "Can you please let me know what the employee handbook say about vacation time during a busy period?",
    },
  })

  console.log(result)
  // Outputs:
  // GuardrailCheckResult {
  //   passed: true,
  //   errored: false,
  //   failed: false,
  //   outcome: 'pass'
  // }
}

await basicGuardrailExample();