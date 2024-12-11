import type { Client } from "openapi-fetch";
import { type GuardrailCheckResult, newResultFromCheck, newResultFromError } from ".";
import type { CompletionPayload, Message, paths, schemas } from "../openapi";

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

  async checkMessages(
    messages: Message[],
    guardrailId: string,
    options: CompletionPayload["Options"] = {},
  ): Promise<GuardrailCheckResult> {
    const { data, error } = await this.client.POST("/checks", {
      body: {
        TenantID: this.tenantId,
        GuardrailID: guardrailId,
        Payload: {
          Completion: {
            Messages: messages,
            Options: options,
          },
        },
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

  async checkMessage(
    message: Message,
    guardrailId: string,
    options: CompletionPayload["Options"] = {},
  ): Promise<GuardrailCheckResult> {
    return this.checkMessages([message], guardrailId, options);
  }


  async checkText(
    text: string,
    guardrailId: string,
    options: CompletionPayload["Options"] & {
      As: "user" | "assistant";
    } = {
        As: "user",
      },
  ): Promise<GuardrailCheckResult> {
    const { As, ...rest } = options;
    const role = As || "user";
    return this.checkMessage({
      Role: role,
      Contents: [{ Text: text }],
    }, guardrailId, rest);
  }

  async evaluateByInstance(instanceId: string, payload: schemas["Payload"], opts: {
    persist?: boolean;
  }): Promise<schemas["Entry"]> {
    const { data, error } = await this.client.POST("/evaluations", {
      body: {
        TenantID: "",
        ByInstance: {
          InstanceID: instanceId,
          Payload: payload,
        },
        Persist: opts.persist || true,
      }
    });
    if (error) {
      throw error;
    }
    return data
  }

  async evaluateByConfig(config: schemas["EvaluateRequestByConfig"], opts: {
    persist?: boolean;
  }): Promise<schemas["Entry"]> {
    const { data, error } = await this.client.POST("/evaluations", {
      body: {
        TenantID: "",
        Persist: opts.persist || true,
        ByConfig: config,
      }
    });
    if (error) {
      throw error;
    }
    return data
  }
}
