import type { Client } from "openapi-fetch";
import type { APIError, Call, paths, Payload } from "../openapi";

type GuardrailsClientOptions = {
  tenantId: string;
  client: Client<paths>;
};

export class GuardrailsClient {
  private tenantId: string;
  private client: Client<paths>;

  constructor(options: GuardrailsClientOptions) {
    this.tenantId = options.tenantId;
    this.client = options.client;
  }

  async check(
    guardrailId: string,
    payload: Payload
  ): Promise<GuardrailCheckResult> {
    const { data, error } = await this.client.POST("/calls", {
      body: {
        TenantID: this.tenantId,
        GuardrailID: guardrailId,
        Payload: payload,
      }
    })

    if (error) {
      return new GuardrailCheckResult("error")
    }

    if (!data) {
      return new GuardrailCheckResult("error")
    }

    return new GuardrailCheckResult(data.Outcome)
  }

}

export class GuardrailCheckResult {
  private readonly outcome: Call["Outcome"];

  public readonly passed: boolean = false;
  public readonly errored: boolean = false;
  public readonly failed: boolean = false;

  constructor(outcome: Call["Outcome"]) {
    this.outcome = outcome
    this.passed = outcome === "pass"
    this.errored = outcome === "error"
    this.failed = outcome === "fail"
  }

  getOutcome() {
    return this.outcome
  }
}