import type { Client } from "openapi-fetch";
import { describe, expect, test, vi } from "vitest";
import type { paths } from "../openapi";
import { Trace } from "../signals";
import { makeMockClient } from "../test/fixtures";
import { ObservabilityClient } from "./observability-client";
import { asyncSleep } from "../utils/dates";

describe("constructor", () => {
  test("should set the tenantId and client properties correctly", () => {
    const options = {
      tenantId: "ten_test",
      client: makeMockClient(),
    };
    const client = new ObservabilityClient(options);
    expect(client.getTenantId()).toBe(options.tenantId);
  });
});

describe("newTrace", () => {
  test("should create a new Trace instance and add it to the traces array", () => {
    const client = new ObservabilityClient({
      tenantId: "ten_test",
      client: makeMockClient(),
    });

    const name = "testTrace";
    const trace = client.newTrace(name);

    expect(trace).toBeInstanceOf(Trace);
    expect(client.getTraces()).toContain(trace);
    expect(client.getTraces()).toHaveLength(1);
    expect(client.getTraces()[0]?.getTenantId()).toBe("ten_test");
  });
});

test("markAsTransiting and unmarkAsTransiting", () => {
  const client = new ObservabilityClient({ tenantId: "ten_test", client: makeMockClient() });
  const trace1 = client.newTrace("trace1");
  const trace2 = client.newTrace("trace2");

  client.markAsTransiting([trace1, trace2]);

  expect(client.getInTransit()).toEqual({
    [trace1.getXid()]: trace1,
    [trace2.getXid()]: trace2,
  });

  client.unmarkAsTransiting([trace1]);

  expect(client.getInTransit()).toEqual({
    [trace2.getXid()]: trace2,
  });

  client.unmarkAsTransiting([trace2]);

  expect(client.getInTransit()).toEqual({});

  client.unmarkAsTransiting([trace1, trace2]);

  expect(client.getInTransit()).toEqual({});
});

test("two consecutive flushes without any trace added in between should only fetch once", async () => {

  const mockFetch = vi.fn(async (data: unknown) => {
    await asyncSleep(100);
    return new Response(JSON.stringify({}), { status: 200 });
  });

  const client = new ObservabilityClient({
    tenantId: "ten_test",
    client: makeMockClient(undefined, {
      fetch: mockFetch,
    }),
  });

  const trace1 = client.newTrace("trace1").end();
  const trace2 = client.newTrace("trace2").end();

  expect(client.getQueuedTraces()).toEqual([trace1, trace2]);

  const flush1 = client.flushBatch([trace1, trace2]);

  expect(client.getQueuedTraces()).toEqual([]);

  expect(client.getInTransit()).toEqual({
    [trace1.getXid()]: trace1,
    [trace2.getXid()]: trace2,
  });

  const flush2 = client.flushBatch([trace1, trace2]);

  expect(client.getInTransit()).toEqual({
    [trace1.getXid()]: trace1,
    [trace2.getXid()]: trace2,
  });

  await flush1;
  await flush2;

  expect(mockFetch).toHaveBeenCalledTimes(1);

});

test("two consecutive flushes with an added trace in between should fetch twice", async () => {

  const mockFetch = vi.fn(async (data: unknown) => {
    await asyncSleep(100);
    return new Response(JSON.stringify({}), { status: 200 });
  });

  const client = new ObservabilityClient({
    tenantId: "ten_test",
    client: makeMockClient(undefined, {
      fetch: mockFetch,
    }),
  });

  const trace1 = client.newTrace("trace1").end();
  const trace2 = client.newTrace("trace2").end();

  expect(client.getQueuedTraces()).toEqual([trace1, trace2]);

  const flush1 = client.flushBatch([trace1, trace2]);

  expect(client.getQueuedTraces()).toEqual([]);
  const trace3 = client.newTrace("trace3").end();

  expect(client.getInTransit()).toEqual({
    [trace1.getXid()]: trace1,
    [trace2.getXid()]: trace2,
  });

  const flush2 = client.flushBatch([trace1, trace2, trace3]);
  expect(client.getInTransit()).toEqual({
    [trace1.getXid()]: trace1,
    [trace2.getXid()]: trace2,
    [trace3.getXid()]: trace3,
  });

  await flush1;
  await flush2;

  expect(mockFetch).toHaveBeenCalledTimes(2);

});