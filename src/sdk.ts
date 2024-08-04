import createClient, { type Middleware, type Client } from "openapi-fetch";
import type { paths } from "./openapi";
import { GuardrailsClient } from "./guardrails/guardrails-client";
import { isAPIError } from "./utils/problems";
import { ObservabilityClient } from "./observability/observability-client";

type ModelmetryClientOptions = {
  tenantId: string;
  apikey: string;
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
};

export class ModelmetryClient {
  private tenantId: string;
  private apikey: string;
  private baseUrl: string;
  private fetch: typeof globalThis.fetch;
  private client: Client<paths>;

  private _guardrails: GuardrailsClient;
  private _observability: ObservabilityClient;

  constructor(options: ModelmetryClientOptions) {
    if (!options.apikey.length) {
      throw new Error(
        "API key not set. Please set the API key when initialising ModelmetryClient.",
      );
    }
    if (!options.tenantId.length || !options.tenantId.startsWith("ten_")) {
      throw new Error(
        "Tenant id not set or invalid. Please set a valid tenant id when initialising ModelmetryClient.",
      );
    }

    // Initialize the overarching client
    this.tenantId = options.tenantId;
    this.apikey = options.apikey;
    this.baseUrl = options.baseUrl;
    this.fetch = options.fetch || globalThis.fetch;
    this.client = createClient<paths>({
      baseUrl: options.baseUrl,
      fetch: this.fetch,
    });

    // client middlewares
    // this.client.use(this.throwOnErrorResponseMiddleware());
    this.client.use(this.authenticateRequestMiddleware());

    // Initialize the Guardrails client
    this._guardrails = new GuardrailsClient({
      client: this.client,
      tenantId: this.tenantId,
    });

    // Initialize the Observability client
    this._observability = new ObservabilityClient({
      client: this.client,
      tenantId: this.tenantId,
    });
  }

  guardrails() {
    return this._guardrails;
  }

  observability() {
    return this._observability;
  }

  getClient() {
    return this.client;
  }

  getBaseURL() {
    return this.baseUrl;
  }

  private throwOnErrorResponseMiddleware: () => Middleware = () => {
    return {
      onResponse: async ({ response }) => {
        const { body, ...responseOptions } = response;

        const isError = !response.ok || response.status >= 400;
        if (!isError) {
          return response
        }

        const errorBody = (await response.json());
        if (isAPIError(errorBody)) {
          throw errorBody;
        }

        return new Response(body, { ...responseOptions });
      },
    }
  };

  private authenticateRequestMiddleware: () => Middleware = () => {
    return {
      onRequest: async ({ request }) => {
        const newRequest = request.clone();
        newRequest.headers.set("x-api-key", this.apikey);
        return newRequest;
      },
    };
  };
}
