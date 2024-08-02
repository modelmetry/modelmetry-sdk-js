import type { components } from "./schema";

export type * from "./schema";
export type * from "./builders";

// export common types
export type schemas = components["schemas"];

export type Call = schemas["Call"];

export type APIError = schemas["ErrorModel"];

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
