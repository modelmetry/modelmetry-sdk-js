import type { Client } from "openapi-fetch";
import type { paths, schemas } from "../openapi";
import { Trace } from "../signals/trace";
import { buildIngestBatchFromTraces } from "./utils";
import { APIError } from "../utils/problems";

type ObservabilityClientOptions = {
  tenantId: string;
  client: Client<paths>;
};

export class ObservabilityClient {
  private tenantId: string;
  private client: Client<paths>;
  private traces: Trace[] = [];

  // in-transit
  private inTransit: Trace[] = [];
  private isFlushing = false;

  constructor(options: ObservabilityClientOptions) {
    this.tenantId = options.tenantId;
    this.client = options.client;
  }

  newTrace(name: string): Trace {
    const trace = new Trace({
      name,
      tenantId: this.tenantId,
      attributes: {},
    });
    this.traces.push(trace);
    return trace;
  }

  async flushAll(): Promise<void> {
    if (this.isFlushing) {
      console.log("A flush is already in progress");
      return;
    }

    this.isFlushing = true;

    // a. select the traces that have ended to transit
    // b. and remove them from the list of traces to be flushed
    // c. add them to the in-transit list
    const tracesToTransit = this.traces.filter((t) => t.hasEnded());
    const idsOfTracesToTransit = tracesToTransit.map((t) => t.getXid());
    this.traces = this.traces.filter((t) => !idsOfTracesToTransit.includes(t.getXid()));
    this.inTransit.push(...tracesToTransit);

    // bail early if there's nothing to flush
    if (this.inTransit.length === 0) {
      this.isFlushing = false;
      return;
    }

    try {

      // build the batch
      const batch = buildIngestBatchFromTraces(this.inTransit);

      // send the batch
      const { error } = await this.client.POST("/signals/ingest/v1", { body: { ...batch } });

      // handle errors
      if (error) throw new APIError(error);

      // clear the traces in transit as they have been successfully flushed
      this.inTransit = [];

    } catch (error) {

      // restore the traces that failed to flush
      this.traces.push(...this.inTransit);
      this.inTransit = [];

      // handle errors
      if (error instanceof APIError) {
        console.error("Failed to flush traces (api error)", error.errorModel);
        return;
      }

      // handle other errors
      console.error("Failed to flush traces (unknown)", error);

    } finally {
      this.isFlushing = false;
    }

    return;
  }
}
