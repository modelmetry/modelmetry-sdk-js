import createClient, { type Middleware, type Client } from "openapi-fetch";
import type { paths } from "./openapi";
import { GuardrailsClient } from "./guardrails/guardrails-client";

type ModelmetryClientOptions = {
  apikey: string;
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
};

export class ModelmetryClient {
  private apikey: string;
  private baseUrl: string;
  private fetch: typeof globalThis.fetch;
  private client: Client<paths>;

  private _guardrails: GuardrailsClient;

  constructor(options: ModelmetryClientOptions) {
    if (!options.apikey.length) {
      throw new Error("API key not set. Please set the API key before making requests.");
    }

    // Initialize the overarching client
    this.apikey = options.apikey;
    this.baseUrl = options.baseUrl;
    this.fetch = options.fetch ?? globalThis.fetch;
    this.client = createClient<paths>({
      baseUrl: options.baseUrl,
      fetch: this.fetch,
    });
    this.client.use(this.authenticateRequestMiddleware());

    // Initialize the Guardrails client
    this._guardrails = new GuardrailsClient({ client: this.client });
  }

  guardrails() {
    return this._guardrails;
  }

  getClient() {
    return this.client;
  }

  getBaseURL() {
    return this.baseUrl;
  }

  private authenticateRequestMiddleware: () => Middleware = () => {
    return {
      onRequest: async ({ request }) => {
        request.headers.set("Authorization", `Bearer ${this.apikey}`);
        return request;
      }
    }
  }
}
