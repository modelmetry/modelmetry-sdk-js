import type { schemas } from "../openapi";
import type { CompletionSpan } from "./span.completion";
import type { EmbeddingsSpan } from "./span.embeddings";
import type { OtherSpan } from "./span.other";
import type { RetrievalSpan } from "./span.retrieval";

export * from "./finding";
export * from "./trace";
export * from "./event";
export * from "./span.base";
export * from "./span.completion";
export * from "./span.embeddings";
export * from "./span.retrieval";
export * from "./span.other";

export type IngestBatch = schemas["IngestSignalsV1RequestBody"];
export type Span = RetrievalSpan | EmbeddingsSpan | CompletionSpan | OtherSpan;
