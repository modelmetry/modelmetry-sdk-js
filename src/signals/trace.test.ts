import { describe, test } from "vitest";
import { Trace } from "./trace";

test("instantiates a trace", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  expect(trace).toBeDefined();
  expect(trace.getName()).toBe("test");
  expect(trace.getTenantId()).toBe("ten_test");
})

test("created span should be present in trace", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  const span = trace.newSpan("database call");
  expect(trace.getChildrenSpans()).toContain(span);
})

test("creates a span", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  const span = trace.newSpan("database call");
  expect(span).toBeDefined();
  expect(span.getName()).toBe("database call");
  expect(span.getTraceId()).toBe(trace.getXid());
  expect(span.getFamily()).toBe("unset");
})

describe("creates a span with family", () => {

  test("embeddings", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.newEmbeddingsSpan("embeddings call");
    expect(span.getFamily()).toBe("embeddings");
  })

  test("retrieval", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.newRetrievalSpan("retrieval call");
    expect(span.getFamily()).toBe("retrieval");
  })

  test("completion", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.newCompletionSpan("completion call");
    expect(span.getFamily()).toBe("completion");
  })

  test("unset", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.newSpan("unset call");
    expect(span.getFamily()).toBe("unset");
  })

})

test("returns all descendant spans", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  const span1 = trace.newSpan("span1");
  const span2 = trace.newSpan("span2");
  const span3 = span1.newSpan("span3");
  const span4 = span1.newSpan("span4");
  const span5 = span2.newSpan("span5");

  const descendantSpans = trace.getDescendantSpans();

  expect(trace.getDescendantSpansCount()).toBe(5);

  expect(descendantSpans).toContain(span1);
  expect(descendantSpans).toContain(span2);
  expect(descendantSpans).toContain(span3);
  expect(descendantSpans).toContain(span4);
  expect(descendantSpans).toContain(span5);
});

test("sets endedAt automatically when there are no child spans", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  trace.setEndedAtAutomatically();
  expect(trace.getEndedAt()).toBeDefined();
});

test("sets endedAt automatically when there are child spans", ({ expect }) => {
  const trace = new Trace({ name: "test", tenantId: "ten_test" });
  const span1 = trace.newSpan("span1");
  const span2 = trace.newSpan("span2");
  span1.setEndedAt(new Date("2022-01-01T00:00:00Z"));
  span2.setEndedAt(new Date("2022-01-02T00:00:00Z"));
  trace.setEndedAtAutomatically();
  expect(trace.getEndedAt()).toEqual(new Date("2022-01-02T00:00:00Z"));
});