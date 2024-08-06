import {
  BaseSpan,
  CompletionSpan,
  type CompletionSpanArgs,
  EmbeddingsSpan,
  type EmbeddingsSpanArgs,
  OtherSpan,
  type OtherSpanArgs,
  RetrievalSpan,
  type RetrievalSpanArgs,
  type Span,
  type SpanTypeMap,
  type Trace,
  isSpan,
  isTrace,
} from ".";

export function createSpan(
  parent: BaseSpan | Span | Trace,
  name: string,
  kind: "completion",
  args: Partial<CompletionSpanArgs>,
): CompletionSpan;
export function createSpan(
  parent: BaseSpan | Span | Trace,
  name: string,
  kind: "embeddings",
  args: Partial<EmbeddingsSpanArgs>,
): EmbeddingsSpan;
export function createSpan(
  parent: BaseSpan | Span | Trace,
  name: string,
  kind: "retrieval",
  args: Partial<RetrievalSpanArgs>,
): RetrievalSpan;
export function createSpan(
  parent: BaseSpan | Span | Trace,
  name: string,
  kind: "other",
  args: Partial<OtherSpanArgs>,
): OtherSpan;
export function createSpan(
  parent: BaseSpan | Span | Trace,
  name: string,
  kind: "completion" | "embeddings" | "retrieval" | "other",
  args:
    | Partial<CompletionSpanArgs>
    | Partial<EmbeddingsSpanArgs>
    | Partial<RetrievalSpanArgs>
    | Partial<OtherSpanArgs>,
) {

  let traceId = "";
  let parentId: string | undefined;
  if (isTrace(parent)) {
    traceId = parent.getXid();
    parentId = undefined;
  } else if (isSpan(parent)) {
    traceId = parent.getTraceId();
    parentId = parent.getXid();
  } else if (parent instanceof BaseSpan) {
    traceId = parent.getTraceId();
    parentId = parent.getXid();
  }

  switch (kind) {
    case "completion": {
      const span = new CompletionSpan({
        ...args,
        parentId,
        name,
        traceId,
      });
      parent.appendSpan(span);
      return span as CompletionSpan;
    }

    case "embeddings": {
      const span = new EmbeddingsSpan({
        ...args,
        parentId,
        name,
        traceId,
      });
      parent.appendSpan(span);
      return span as EmbeddingsSpan;
    }

    case "retrieval": {
      const span = new RetrievalSpan({
        ...args,
        parentId,
        name,
        traceId,
      });
      parent.appendSpan(span);
      return span as RetrievalSpan;
    }

    default: {
      const span = new OtherSpan({
        ...args,
        parentId,
        name,
        traceId,
      });
      parent.appendSpan(span);
      return span as OtherSpan;
    }
  }
}

export async function startSpan<O, SpanKind extends keyof SpanTypeMap>(
  caller: BaseSpan | Span | Trace,
  name: string,
  kind: SpanKind,
  callback: (span: SpanTypeMap[SpanKind]) => Promise<O>,
): Promise<O> {
  switch (kind) {
    case "completion": {
      const span = createSpan(caller, name, kind, {});
      const output = await callback(span as SpanTypeMap[SpanKind]);
      span.setEndedAt(new Date());
      return output;
    }
    case "embeddings": {
      const span = createSpan(caller, name, kind, {});
      const output = await callback(span as SpanTypeMap[SpanKind]);
      span.setEndedAt(new Date());
      return output;
    }
    case "retrieval": {
      const span = createSpan(caller, name, kind, {});
      const output = await callback(span as SpanTypeMap[SpanKind]);
      span.setEndedAt(new Date());
      return output;
    }
    case "other": {
      const span = createSpan(caller, name, kind, {});
      const output = await callback(span as SpanTypeMap[SpanKind]);
      span.setEndedAt(new Date());
      return output;
    }
    default: {
      throw new Error("Invalid span kind");
    }
  }

}
