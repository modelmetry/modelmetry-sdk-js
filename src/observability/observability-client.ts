import type { Client } from "openapi-fetch";
import type { paths } from "../openapi";
import { Trace } from "../signals/trace";
import { buildIngestBatchFromTraces, calculateKilobyteSize } from "./utils";
import { APIError } from "../utils/problems";
import { Span } from "../signals";

export type ObservabilityClientOptions = {
  tenantId: string;
  client: Client<paths>;

  onFlushed?: (traces: Trace[]) => void;

  //
  maxBatchLen?: number;
  maxSizeKb?: number;
  intervalMs?: number;
};

export class ObservabilityClient {
  private MAX_SIZE_KB = 5
  private MAX_BATCH_LEN = 5;
  private INTERVAL_MS = 1000;
  public timeout: NodeJS.Timeout | null = null;

  //
  private tenantId: string;
  private client: Client<paths>;
  private traces: Trace[] = [];

  // in-transit
  private flights: Record<string, Promise<unknown>> = {}
  private inTransit: Record<string, Trace> = {};
  private onFlushed: (traces: Trace[]) => void = () => { };

  constructor(options: ObservabilityClientOptions) {
    this.tenantId = options.tenantId;
    this.client = options.client;

    if (options.onFlushed) {
      this.onFlushed = options.onFlushed;
    }
    if (options.intervalMs) {
      this.INTERVAL_MS = options.intervalMs;
    }
    if (options.maxBatchLen) {
      this.MAX_BATCH_LEN = options.maxBatchLen;
    }
    if (options.maxSizeKb) {
      this.MAX_SIZE_KB = options.maxSizeKb;
    }

    this.startTimer();
  }

  getTenantId() {
    return this.tenantId;
  }

  getTraces() {
    return this.traces;
  }

  getInTransit() {
    return this.inTransit;
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

  getQueuedTraces(): Trace[] {
    const queued = this.traces.filter((t) => t.hasEnded() && !this.inTransit[t.getXid()]);
    return queued;
  }

  markAsTransiting(traces: Trace[]): void {
    for (const trace of traces) {
      this.inTransit[trace.getXid()] = trace;
    }
  }

  unmarkAsTransiting(traces: Trace[]): void {
    for (const trace of traces) {
      delete this.inTransit[trace.getXid()];
    }
  }

  async flushBatch(traces: Trace[]): Promise<void> {
    const batchId = Math.random().toString(36).substring(7);

    // a. select the traces that have ended to transit
    // b. and remove them from the list of traces to be flushed
    // c. add them to the in-transit list
    const tracesToTransit = traces.filter((t) => {
      // if the trace has not ended, bail early
      if (!t.hasEnded()) return false;

      // if the trace is already in transit, bail early
      if (this.inTransit[t.getXid()]) return false;

      // ok
      return true;
    });

    // mark them as in transit
    this.markAsTransiting(tracesToTransit);

    // remove the traces to transit from the list of traces to be flushed
    const idsOfTracesToTransit = tracesToTransit.map((t) => t.getXid());
    this.traces = this.traces.filter((t) => !idsOfTracesToTransit.includes(t.getXid()));

    // bail early if there's nothing to flush
    if (tracesToTransit.length === 0) {
      return;
    }

    try {

      // build the batch
      const batch = buildIngestBatchFromTraces(tracesToTransit);

      // store the promise
      const flight = this.client.POST("/signals/ingest/v1", { body: { ...batch } });
      this.flights[batchId] = flight;
      flight.finally(() => { delete this.flights[batchId] });

      // send the batch
      const { error } = await flight;

      // handle errors
      if (error) throw new APIError(error);

      // callback
      this.onFlushed(tracesToTransit);

    } catch (error) {

      // restore the traces that failed to flush
      this.traces.push(...tracesToTransit);

      // handle errors
      if (error instanceof APIError) {
        console.error("Failed to flush traces (api error)", error.errorModel);
        return;
      }

      // handle other errors
      console.error("Failed to flush traces (unknown)", error);

    } finally {
      // mark them as not in transit
      this.unmarkAsTransiting(tracesToTransit);
    }

    console.log(`Flushed ${tracesToTransit.length} traces`);
    return;
  }

  async flushIfConditionsFulfilled(): Promise<void> {
    const queue = this.getQueuedTraces();
    if (queue.length >= this.MAX_BATCH_LEN) {
      return this.flushBatch(queue);
    }

    const size = calculateKilobyteSize(queue);
    if (size >= this.MAX_SIZE_KB) {
      return this.flushBatch(queue);
    }

    return;
  }

  async flushAll(): Promise<void> {
    return this.flushBatch(this.traces);
  }

  async shutdown(): Promise<void> {
    this.stopTimer();

    try {
      // flush all traces
      await this.flushAll();

      // if there are no more flights, bail early
      if (Object.values(this.flights).length === 0) return;

      // wait for all flights to land
      await Promise.all(Object.values(this.flights).map((x) => x.catch(() => { })));

      // flush one more time in case some traces were added during the wait
      await this.flushAll();

    } catch (error) {
      console.error("Error whilst shutting down the observability client", error);
    }
  }

  async handleTimerExecution() {
    if (!this.timeout) return

    // clear the timeout
    this.stopTimer();

    // flush the traces
    this.flushIfConditionsFulfilled();

    // set the timeout again
    this.startTimer();
  }

  stopTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null
    }
  }

  startTimer() {
    if (this.timeout) return
    if (this.INTERVAL_MS <= 0) return
    this.timeout = setTimeout(async () => await this.handleTimerExecution(), this.INTERVAL_MS);
  }
}
