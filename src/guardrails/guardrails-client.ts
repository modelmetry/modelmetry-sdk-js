import type { Client } from "openapi-fetch";
import { type GuardrailCheckResult, newResultFromCheck, newResultFromError } from ".";
import type { Payload, paths } from "../openapi";

type GuardrailsClientOptions = {
  tenantId?: string;
  client: Client<paths>;
};

export class GuardrailsClient {
  private client: Client<paths>;
  private tenantId?: string;


  constructor(options: GuardrailsClientOptions) {
    this.client = options.client;
    if (options.tenantId) {
      this.tenantId = options.tenantId;
    }
  }

  async check(
    payload: Payload,
    guardrailId: string,
  ): Promise<GuardrailCheckResult> {
    const { data, error } = await this.client.POST("/checks", {
      body: {
        TenantID: this.tenantId,
        GuardrailID: guardrailId,
        Payload: payload,
      },
    });

    if (error) {
      return newResultFromError(error);
    }

    if (!data) {
      if (error) {
        return newResultFromError(error);
      }
      return newResultFromError(
        new Error("No data or error returned from API"),
      );
    }

    return newResultFromCheck(data);
  }
}
