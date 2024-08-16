import type { components } from "./schema.d";
import type openai from "openai";

export * from "./schema.d";

// export common types
export type schemas = components["schemas"];

export type FamilyData =
  | schemas["OtherPayload"]
  | schemas["CompletionPayload"]
  | schemas["RetrievalPayload"]
  | schemas["EmbeddingsPayload"];
export type OtherPayload = schemas["OtherPayload"];
export type CompletionPayload = schemas["CompletionPayload"];
export type RetrievalPayload = schemas["RetrievalPayload"];
export type EmbeddingsPayload = schemas["EmbeddingsPayload"];

export type Call = schemas["Call"];

export type ErrorModel = schemas["ErrorModel"];

export type Payload = schemas["Payload"];

export type Input = NonNullable<schemas["Payload"]["Input"]>;

export type ChatInput = schemas["ChatInput"];

export type TextInput = schemas["TextInput"];

export type Output = schemas["Output"];

export type Message =
  | schemas["SystemMessage"]
  | schemas["UserMessage"]
  | schemas["AssistantMessage"]
  | schemas["ToolMessage"];

export type Options = schemas["Options"];

export type TextPart = schemas["TextPart"];
export type DataPart = schemas["DataPart"];
export type Part = TextPart | DataPart;

export type ToolCall = schemas["ToolCall"];

export type Tool = schemas["Tool"];

export type Function = schemas["Function"];

