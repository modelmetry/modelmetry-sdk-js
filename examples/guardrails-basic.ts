import { ModelmetryClient } from "../src/sdk"
import { env } from "node:process";
import 'dotenv/config'
import { newAssistantMessage, newUserMessage } from "../src/openapi";


export const basicGuardrailExample = async () => {

  const TENANT_ID = String(env.TENANT_ID); // e.g., ten_acmelimited12
  const API_KEY = String(env.API_KEY); // e.g. "aDMd92dfn...dm29fj2f92"
  const HOST = String(env.HOST); // e.g. https://api.modelmetry.com
  const GUARDRAIL_ID = String(env.GUARDRAIL_ID); // e.g. https://api.modelmetry.com

  const modelmetry = new ModelmetryClient({
    tenantId: TENANT_ID,
    apikey: API_KEY,
    baseUrl: HOST,
  })

  const result = await modelmetry.guardrails().checkMessages([
    newUserMessage("Can you please let me know what the employee handbook say about vacation time during a busy period?"),
    newAssistantMessage(`Thank you for your inquiry about vacation time during a busy period. While the employee handbook generally outlines our vacation policies, it's important to note that specific circumstances might require flexibility.

Here's a general guideline:
* Prioritization: If your department is experiencing an exceptionally busy period, we encourage you to prioritize your vacation requests to minimize disruption to our operations.
* Manager Approval: All vacation requests must be approved by your direct manager. They will consider your department's workload and staffing needs when making a decision.
* Flexibility: In some cases, we may be able to accommodate your vacation request during a busy period, but this will depend on the specific circumstances.

If you have any further questions or concerns, please don't hesitate to reach out to your manager or HR representative.`)
  ], GUARDRAIL_ID)

  console.log(JSON.stringify(result, null, 2))

  if (result.failed) {
    // Handle a failed check
    console.error("Failed check", result)
    return;
  }

  if (result.errored) {
    // Handle an errored check (an error means an unexpected error occurred, not that the check failed).
    // By default, an error results in a "passed" check with this errored property set to true.
    console.warn("Errored check", result)
    return;
  }

  // The check passed, carry on
  console.info("Passed check", result)
}

await basicGuardrailExample();
process.exit(0);