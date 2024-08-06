import { describe, expect, test } from "vitest";
import { Trace } from "../signals";
import { buildIngestBatchFromTraces, gatherAllFindingsRecursively } from "./utils";

test("should gather all findings recursively", () => {
  // Create some mock traces and spans
  const trace1 = new Trace({ name: "Trace 1", tenantId: "ten_1" });
  const trace2 = new Trace({ name: "Trace 2", tenantId: "ten_2" });
  const trace3 = new Trace({ name: "Trace 3", tenantId: "ten_3" });
  const trace4 = new Trace({ name: "Trace 4", tenantId: "ten_4" });

  const f1 = trace2.newFinding("Finding 1", "value");
  const f2 = trace3.newFinding("Finding 2", "value");
  const f3 = trace4.newFinding("Finding 3", "value");
  const f4 = trace3.newFinding("Finding 4", "value");

  const t2_s1 = trace2.span("t2.s1", "other", {});
  const f5 = t2_s1.newFinding("Finding 5", 5);

  const t3_s1 = trace3.span("t3.s1", "other", {});
  const f6 = t3_s1.newFinding("Finding 6", 6);

  const t3_s1_s1 = t3_s1.span("t3.s1.s1", "other", {});
  const f7 = t3_s1_s1.newFinding("Finding 7", 7);


  // Call the function
  const traces = [trace1, trace2, trace3, trace4];
  const findings = gatherAllFindingsRecursively(traces);

  // Assertions - order does not matter
  expect(findings).toContain(f1);
  expect(findings).toContain(f2);
  expect(findings).toContain(f3);
  expect(findings).toContain(f4);
  expect(findings).toContain(f5);
  expect(findings).toContain(f6);
  expect(findings).toContain(f7);
  expect(findings).toHaveLength(7);
});

describe("should build ingest batch with nested spans and events", () => {
  // Create some mock traces and spans
  const trace1 = new Trace({ name: "Trace 1", tenantId: "ten_1" });
  const trace2 = new Trace({ name: "Trace 2", tenantId: "ten_2" });
  const trace3 = new Trace({ name: "Trace 3", tenantId: "ten_3" });
  const trace4 = new Trace({ name: "Trace 4", tenantId: "ten_4" });

  const f1 = trace2.newFinding("Finding 1", "value");
  const f2 = trace3.newFinding("Finding 2", "value");
  const f3 = trace4.newFinding("Finding 3", "value");
  const f4 = trace3.newFinding("Finding 4", "value");

  const t2_s1 = trace2.span("t2.s1", "other", {});
  const f5 = t2_s1.newFinding("Finding 5", 5);

  const t3_s1 = trace3.span("t3.s1", "other", {});
  const f6 = t3_s1.newFinding("Finding 6", 6);

  const t3_s1_s1 = t3_s1.span("t3.s1.s1", "other", {});
  const f7 = t3_s1_s1.newFinding("Finding 7", 7);

  const e1 = trace1.newEvent("Event 1");
  const e2 = trace2.newEvent("Event 2");
  const e3 = trace3.newEvent("Event 3");
  const e4 = trace4.newEvent("Event 4");

  const t2_s1_e1 = t2_s1.newEvent("Event 5");
  const t3_s1_e1 = t3_s1.newEvent("Event 6");
  const t3_s1_s1_e1 = t3_s1_s1.newEvent("Event 7");

  const traces = [trace1, trace2, trace3, trace4];

  // Call the function
  const batch = buildIngestBatchFromTraces(traces);

  // Assertions - order does not matter

  test("batch should have all traces", () => {
    // assert traces
    expect(batch.Traces).toContainEqual(trace1.toIngestParams());
    expect(batch.Traces).toContainEqual(trace2.toIngestParams());
    expect(batch.Traces).toContainEqual(trace3.toIngestParams());
    expect(batch.Traces).toContainEqual(trace4.toIngestParams());
    expect(batch.Traces).toHaveLength(4);
  })

  test("batch should have all spans", () => {
    // assert spans
    expect(batch.Spans).toContainEqual(t2_s1.toIngestParams());
    expect(batch.Spans).toContainEqual(t3_s1.toIngestParams());
    expect(batch.Spans).toContainEqual(t3_s1_s1.toIngestParams());
    expect(batch.Spans).toHaveLength(3);
  })

  test("batch should have all events", () => {
    // assert events
    expect(batch.Events).toContainEqual(e1.toIngestParams());
    expect(batch.Events).toContainEqual(e2.toIngestParams());
    expect(batch.Events).toContainEqual(e3.toIngestParams());
    expect(batch.Events).toContainEqual(e4.toIngestParams());
    expect(batch.Events).toContainEqual(t2_s1_e1.toIngestParams());
    expect(batch.Events).toContainEqual(t3_s1_e1.toIngestParams());
    expect(batch.Events).toContainEqual(t3_s1_s1_e1.toIngestParams());
    expect(batch.Events).toHaveLength(7);
  })

  test("batch should have all findings", () => {
    // assert findings
    expect(batch.Findings).toContainEqual(f1.toIngestParams());
    expect(batch.Findings).toContainEqual(f2.toIngestParams());
    expect(batch.Findings).toContainEqual(f3.toIngestParams());
    expect(batch.Findings).toContainEqual(f4.toIngestParams());
    expect(batch.Findings).toContainEqual(f5.toIngestParams());
    expect(batch.Findings).toContainEqual(f6.toIngestParams());
    expect(batch.Findings).toContainEqual(f7.toIngestParams());
    expect(batch.Findings).toHaveLength(7);
  })
});