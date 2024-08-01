import type { Client } from "openapi-fetch";
import type { paths } from "../openapi";

type GuardrailsClientOptions = {
  client: Client<paths>;
};

export class GuardrailsClient {
  private client: Client<paths>;

  constructor(options: GuardrailsClientOptions) {
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
