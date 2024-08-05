import type { components } from "./schema";

export type * from "./schema";
export type * from "./builders";

// export common types
export type schemas = components["schemas"];

export type OtherPayload = schemas["OtherPayload"]
export type CompletionPayload = schemas["CompletionPayload"]
export type RetrievalPayload = schemas["RetrievalPayload"]
export type EmbeddingsPayload = schemas["EmbeddingsPayload"]
export type FamilyData = schemas["OtherPayload"] | schemas["CompletionPayload"] | schemas["RetrievalPayload"] | schemas["EmbeddingsPayload"];

export type Call = schemas["Call"];

export type ErrorModel = schemas["ErrorModel"];

export type Payload = schemas["Payload"];

export type Input = schemas["Input"];

export type ChatInput = schemas["ChatInput"];

export type TextInput = schemas["TextInput"];

export type ChatOutput = schemas["ChatOutput"];

export type TextOutput = schemas["TextOutput"];

export type Output = schemas["Output"];

export type SimpleMessage = schemas["SimpleMessage"];

export type SimpleOptions = schemas["SimpleOptions"];

export type SimplePart = schemas["SimplePart"];

export type ToolCall = schemas["ToolCall"];

export type Tool = schemas["Tool"];

export type Function = schemas["Function"];
