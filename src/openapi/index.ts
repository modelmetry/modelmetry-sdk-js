import type { components } from "./schema.d";
import type openai from "openai";

export * from "./schema.d";

// export common types
export type schemas = components["schemas"];

export type Entry = schemas["Entry"];

export type FamilyData =
  | schemas["OtherFamilyData"]
  | schemas["CompletionFamilyData"]
  | schemas["RetrievalFamilyData"]
  | schemas["EmbeddingsFamilyData"];

export type OtherFamilyData = schemas["OtherFamilyData"];
export type CompletionFamilyData = schemas["CompletionFamilyData"];
export type RetrievalFamilyData = schemas["RetrievalFamilyData"];
export type EmbeddingsFamilyData = schemas["EmbeddingsFamilyData"];

export type GuardrailCheck = schemas["GuardrailCheck"];

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

export const newUsageValue = (amount: number, unit: "tokens" = "tokens") => ({ Amount: amount, Unit: unit });