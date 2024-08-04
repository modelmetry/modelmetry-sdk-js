import type { Client } from "openapi-fetch";
import type { paths, schemas } from "../openapi";
import { Trace } from "../signals/trace";

type ObservabilityClientOptions = {
  tenantId: string;
  client: Client<paths>;
};

export class ObservabilityClient {
  private tenantId: string;
  private client: Client<paths>;
  private traces: Trace[] = [];

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
    this.client.POST("/signals/ingest/v1", {
      body: {},
    });
    // flush all traces
    console.log("FLUSHING ALL TRACES");
    for (const trace of this.traces) {
      // for now, just log the trace and delete it from the list
      console.log("[X]", trace.getXid());
      this.traces = this.traces.filter((t) => t.getXid() !== trace.getXid());
    }
  }
}
