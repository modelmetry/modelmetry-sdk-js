import type { ChatInput, ChatOutput, Input, Output, SimpleMessage, SimpleOptions, SimplePart, TextInput, TextOutput, ToolCall } from "..";

export * from "./message-builder"

export const newTextInput = (text: string): TextInput => ({
  Text: text,
});

export const newChatInput = (
  messages: SimpleMessage[],
  options: SimpleOptions,
): ChatInput => ({
  Messages: messages,
  Settings: options,
});

export const newInput = (someInput: ChatInput | TextInput): Input => {
  if ("Text" in someInput) {
    return { Text: someInput };
  }
  return { Chat: someInput };
};

export const newTextOutput = (text: string): TextOutput => ({
  Text: text,
});

export const newChatOutput = (
  messages: SimpleMessage[],
  options: SimpleOptions,
): ChatOutput => ({
  Messages: messages,
  Settings: options,
});

export const newOutput = (someOutput: ChatOutput | TextOutput): Output => {
  if ("Text" in someOutput) {
    return { Text: someOutput };
  }
  return { Chat: someOutput };
};

export const newMessages = (...messages: SimpleMessage[]): SimpleMessage[] => messages;

export const newTextPart = (text: SimplePart["Text"]): SimplePart => ({
  Text: text,
});

export const newImagePart = (
  uri: SimplePart["URI"],
  mime: SimplePart["MimeType"],
  detail?: SimplePart["Detail"],
): SimplePart => ({
  Text: "",
  URI: uri,
  MimeType: mime,
  Detail: detail,
});

export const newChatOptions = (
  options?: Partial<SimpleOptions>,
): SimpleOptions => options || {};

export const newToolCall = (
  id: ToolCall["ID"],
  func: ToolCall["Function"],
  type: ToolCall["Type"] = "function",
): ToolCall => ({
  ID: id,
  Function: func,
  Type: type,
});
