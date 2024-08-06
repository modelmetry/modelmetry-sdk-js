import type { schemas } from "../openapi";
import { CompletionSpan } from "./span.completion";
import { EmbeddingsSpan } from "./span.embeddings";
import { OtherSpan } from "./span.other";
import { RetrievalSpan } from "./span.retrieval";

export * from "./finding";
export * from "./trace";
export * from "./event";
export * from "./span.completion";
export * from "./span.embeddings";
export * from "./span.retrieval";
export * from "./span.other";
export * from "./span.start";
export * from "./span.base";

export type IngestBatch = schemas["IngestSignalsV1RequestBody"];
export type Span = RetrievalSpan | EmbeddingsSpan | CompletionSpan | OtherSpan;

export const isSpan = (span: unknown): span is Span => {
  return (
    span instanceof RetrievalSpan ||
    span instanceof EmbeddingsSpan ||
    span instanceof CompletionSpan ||
    span instanceof OtherSpan
  );
};

export const SpanLookup = {
  completion: {
    class: CompletionSpan,
  },
  embeddings: {
    class: EmbeddingsSpan,
  },
  retrieval: {
    class: RetrievalSpan,
  },
  other: {
    class: OtherSpan,
  },
};

export type LookupSpan = typeof SpanLookup;

export type SpanTypeMap = {
  completion: CompletionSpan;
  embeddings: EmbeddingsSpan;
  retrieval: RetrievalSpan;
  other: OtherSpan;
};
