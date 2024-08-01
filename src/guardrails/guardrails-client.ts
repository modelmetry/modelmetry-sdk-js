import type { Client } from "openapi-fetch";
import type { paths } from "../openapi";

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

  // check() {
  //   this.client.POST("/calls", {
  //     body: {

  //     }
  //   })

  //   return this.client;
  // }

}
