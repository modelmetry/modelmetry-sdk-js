import type { schemas } from "../openapi";
import { CompletionSpan } from "./span.completion";
import { EmbeddingsSpan } from "./span.embeddings";
import { OtherSpan } from "./span.other";
import { RetrievalSpan } from "./span.retrieval";

export * from "./finding";
export * from "./span.start";
export * from "./trace";
export * from "./event";
export * from "./span.base";
export * from "./span.completion";
export * from "./span.embeddings";
export * from "./span.retrieval";
export * from "./span.other";

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
