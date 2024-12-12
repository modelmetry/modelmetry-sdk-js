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

  async checkText(
    text: string,
    options: CompletionPayload["Options"] & {
      as?: "user" | "assistant";
      guardrailId: string;
    },
  ): Promise<GuardrailCheckResult> {
    const { as, guardrailId, ...rest } = options;
    const role = as || "user";
    return this.checkMessage({
      Role: role,
      Contents: [{ Text: text }],
    }, { ...rest, guardrailId });
  }

  async checkMessage(
    message: Message,
    options: CompletionPayload["Options"] & {
      guardrailId: string;
    },
  ): Promise<GuardrailCheckResult> {
    return this.checkMessages([message], options);
  }

  async checkMessages(
    messages: Message[],
    options: CompletionPayload["Options"] & {
      guardrailId: string;
    },
  ): Promise<GuardrailCheckResult> {
    const { guardrailId, ...rest } = options;
    const { data, error } = await this.client.POST("/checks", {
      body: {
        TenantID: this.tenantId,
        GuardrailID: guardrailId,
        Payload: {
          Completion: {
            Messages: messages,
            Options: rest,
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
