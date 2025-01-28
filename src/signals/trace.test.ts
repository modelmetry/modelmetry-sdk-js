import { describe, expect, test } from "vitest";
import { Trace, CompletionSpan, EmbeddingsSpan, RetrievalSpan, OtherSpan } from ".";

test("instantiates a trace", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    expect(trace).toBeDefined();
    expect(trace.getName()).toBe("test");
    expect(trace.getTenantId()).toBe("ten_test");
})

test("created span should be present in trace", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.span("database call", "other", {});
    expect(trace.getChildrenSpans()).toContain(span);
})

test("creates a span", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span = trace.span("database call", "other", {});
    expect(span).toBeDefined();
    expect(span.getName()).toBe("database call");
    expect(span.getTraceId()).toBe(trace.getXid());
    expect(span.getFamily()).toBe("unset");
})

describe("creates a span with family", () => {

    test("embeddings", ({ expect }) => {
        const trace = new Trace({ name: "test", tenantId: "ten_test" });
        const span = trace.span("embeddings call", "embeddings", {});
        expect(span.getFamily()).toBe("embeddings");
    })

    test("retrieval", ({ expect }) => {
        const trace = new Trace({ name: "test", tenantId: "ten_test" });
        const span = trace.span("retrieval call", "retrieval", {});
        expect(span.getFamily()).toBe("retrieval");
    })

    test("completion", ({ expect }) => {
        const trace = new Trace({ name: "test", tenantId: "ten_test" });
        const span = trace.span("completion call", "completion", {});
        expect(span.getFamily()).toBe("completion");
    })

    test("unset", ({ expect }) => {
        const trace = new Trace({ name: "test", tenantId: "ten_test" });
        const span = trace.span("unset call", "other", {});
        expect(span.getFamily()).toBe("unset");
    })

})

test("returns all descendant spans", ({ expect }) => {
    const trace = new Trace({ name: "test", tenantId: "ten_test" });
    const span1 = trace.span("span1", "other", {});
    const span2 = trace.span("span2", "other", {});
    const span3 = span1.span("span3", "other", {});
    const span4 = span1.span("span4", "other", {});
    const span5 = span2.span("span5", "other", {});

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
    const span1 = trace.span("span1", "other", {});
    const span2 = trace.span("span2", "other", {});
    span1.setEndedAt(new Date("2022-01-01T00:00:00Z"));
    span2.setEndedAt(new Date("2022-01-02T00:00:00Z"));
    trace.setEndedAtAutomatically();
    expect(trace.getEndedAt()).toEqual(new Date("2022-01-02T00:00:00Z"));
});

describe("startSpan to return the callback's return value", async () => {

    const trace = new Trace({ name: "test", tenantId: "ten_test" });

    test("completion span", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: we are testing the return value of the callback
        let s: any;
        const output = await trace.startSpan(
            "span1",
            "completion",
            async (span) => {
                span.setMetadata("key", "value");
                s = span;
                return "the actual output";
            },
        );
        expect(output).toBe("the actual output");
        expect(s).toBeInstanceOf(CompletionSpan);
        expect(s.getAllMetadata()).toEqual({ key: "value" });
    });

    test("embeddings span", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: we are testing the return value of the callback
        let s: any;
        const output = await trace.startSpan(
            "span1",
            "embeddings",
            async (span) => {
                span.setMetadata("key", "value");
                s = span;
                return "the actual output";
            },
        );
        expect(output).toBe("the actual output");
        expect(s).toBeInstanceOf(EmbeddingsSpan);
        expect(s.getAllMetadata()).toEqual({ key: "value" });
    });

    test("retrieval span", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: we are testing the return value of the callback
        let s: any;
        const output = await trace.startSpan(
            "span1",
            "retrieval",
            async (span) => {
                span.setMetadata("key", "value");
                s = span;
                return "the actual output";
            },
        );
        expect(output).toBe("the actual output");
        expect(s).toBeInstanceOf(RetrievalSpan);
        expect(s.getAllMetadata()).toEqual({ key: "value" });
    });

    test("other span", async () => {
        // biome-ignore lint/suspicious/noExplicitAny: we are testing the return value of the callback
        let s: any;
        const output = await trace.startSpan(
            "span1",
            "other",
            async (span) => {
                span.setMetadata("key", "value");
                s = span;
                return "the actual output";
            },
        );
        expect(output).toBe("the actual output");
        expect(s).toBeInstanceOf(OtherSpan);
        expect(s.getAllMetadata()).toEqual({ key: "value" });
    });

});

