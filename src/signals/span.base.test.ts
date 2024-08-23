import { CompletionSpan, EmbeddingsSpan, OtherSpan, RetrievalSpan } from ".";
import { describe, expect, test } from "vitest";

describe("concrete spans can create other spans", () => {

  test("concrete EmbeddingsSpan can create other spans", () => {
    const span = new EmbeddingsSpan({ name: "root", traceId: "tra_a" })
    const child = span.span("child", "other", {})
    expect(child.getName()).toBe("child")
    expect(child.getFamily()).toBe("unset")
    expect(child.getTraceId()).toBe("tra_a")
    expect(child).toBeInstanceOf(OtherSpan)
  })

  test("concrete OtherSpan can create other spans", () => {
    const span = new OtherSpan({ name: "root", traceId: "tra_a" })
    const child = span.span("child", "completion", {})
    expect(child.getName()).toBe("child")
    expect(child.getFamily()).toBe("completion")
    expect(child.getTraceId()).toBe("tra_a")
    expect(child).toBeInstanceOf(CompletionSpan)
  })

  test("concrete CompletionSpan can create other spans", () => {
    const span = new CompletionSpan({ name: "root", traceId: "tra_a" })
    const child = span.span("child", "retrieval", {})
    expect(child.getName()).toBe("child")
    expect(child.getFamily()).toBe("retrieval")
    expect(child.getTraceId()).toBe("tra_a")
    expect(child).toBeInstanceOf(RetrievalSpan)
  })

  test("concrete RetrievalSpan can create other spans", () => {
    const span = new RetrievalSpan({ name: "root", traceId: "tra_a" })
    const child = span.span("child", "embeddings", {})
    expect(child.getName()).toBe("child")
    expect(child.getFamily()).toBe("embeddings")
    expect(child.getTraceId()).toBe("tra_a")
    expect(child).toBeInstanceOf(EmbeddingsSpan)
  })

})

describe("concrete spans can start other spans", () => {

  test("concrete EmbeddingsSpan can start other spans", async () => {
    const span = new EmbeddingsSpan({ name: "root", traceId: "tra_a" })
    const output = await span.startSpan("child", "other", async (span) => {
      return "output"
    })
    expect(output).toBe("output")
  })

  test("concrete OtherSpan can start other spans", async () => {
    const span = new OtherSpan({ name: "root", traceId: "tra_a" })
    const output = await span.startSpan("child", "completion", async (span) => {
      return "output"
    })
    expect(output).toBe("output")
  })

  test("concrete CompletionSpan can start other spans", async () => {
    const span = new CompletionSpan({ name: "root", traceId: "tra_a" })
    const output = await span.startSpan("child", "retrieval", async (span) => {
      return "output"
    })
    expect(output).toBe("output")
  })

  test("concrete RetrievalSpan can start other spans", async () => {
    const span = new RetrievalSpan({ name: "root", traceId: "tra_a" })
    const output = await span.startSpan("child", "embeddings", async (span) => {
      return "output"
    })
    expect(output).toBe("output")
  })

})

test("span()", () => {

  const span = new CompletionSpan({
    name: "root",
    traceId: "tra_a",
  })

  const child = span.span("child", "completion", {
    message: "some message",
  })

  expect(child.getName()).toBe("child")
  expect(child.getMessage()).toBe("some message")

  const grandChild = child.span("grandChild", "completion", {})
  grandChild.setModel("gpt")

  expect(grandChild.getName()).toBe("grandChild")
  expect(grandChild.getFamilyData()).toEqual({
    Options: {
      Model: "gpt",
    },
  })

})

test("startSpan()", async () => {

  const span = new CompletionSpan({
    name: "root",
    traceId: "tra_a",
  })

  let s: CompletionSpan | undefined = undefined;

  const output = await span.startSpan("child", "completion", async (span) => {
    span.setModel("gpt")
    s = span
    return "output"
  })

  expect(output).toBe("output")
  expect(s).toBeDefined()
  expect(s).toBeInstanceOf(CompletionSpan)

})

test("startSpan() throws", async () => {
  const span = new CompletionSpan({ name: "root", traceId: "tra_a" })
  expect(async () => span.startSpan("child", "completion", async () => {
    throw new Error("error")
  })).rejects.toThrow()
})