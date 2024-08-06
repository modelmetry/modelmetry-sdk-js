import { newImagePart, newTextPart } from ".";
import type { SimpleMessage, SimplePart, ToolCall } from "..";
import type OpenAI from "openai";

export const newMessagesFromOpenai = (messages: OpenAI.Chat.ChatCompletionMessageParam[]) =>
  messages.map((m) => newMessageFromOpenai(m));

export const newMessageFromOpenai = (input: OpenAI.Chat.ChatCompletionMessageParam): SimpleMessage => {
  const builder = new MessageBuilder(input.role)

  if ("name" in input && input.name) {
    builder.setName(input.name)
  }

  if ("tool_call_id" in input && input.tool_call_id) {
    builder.setToolCallID(input.tool_call_id)
  }

  if (Array.isArray(input.content)) {
    for (const part of input.content) {
      if (part.type === "image_url") {
        builder.appendContent(newImagePart(part.image_url.url, part.type, part.image_url.detail))
      } else {
        builder.appendContent(newTextPart(part.text))
      }
    }
  } else if (typeof input.content === "string") {
    builder.setTextContent(input.content)
  } else { }

  return builder.build()
};

export const newTextMessage = (
  role: SimpleMessage["Role"],
  text: string,
): SimpleMessage => ({
  Role: role,
  Contents: [newTextPart(text)],
});

export class MessageBuilder {
  private message: SimpleMessage = {
    Role: "system",
    Contents: [],
    Name: undefined,
    ToolCallID: undefined,
    ToolCalls: [],
  };

  constructor(role: SimpleMessage["Role"]) {
    this.message.Role = role;
  }

  setRole(role: SimpleMessage["Role"]): MessageBuilder {
    this.message.Role = role;
    return this;
  }

  setAssistantRole(): MessageBuilder {
    return this.setRole("assistant");
  }

  setSystemRole(): MessageBuilder {
    return this.setRole("system");
  }

  setUserRole(): MessageBuilder {
    return this.setRole("user");
  }

  setToolCallID(toolCallId: string): MessageBuilder {
    this.message.ToolCallID = toolCallId;
    return this;
  }

  setName(name: string): MessageBuilder {
    this.message.Name = name;
    return this;
  }

  addToolCall(toolCall: ToolCall): MessageBuilder {
    if (!this.message.ToolCalls) {
      this.message.ToolCalls = [];
    }
    this.message.ToolCalls.push(toolCall);
    return this;
  }

  // Content of the message

  setContents(contents: SimplePart[]): MessageBuilder {
    if (!this.message.Contents) {
      this.message.Contents = [];
    }
    this.message.Contents = contents;
    return this;
  }

  setTextContent(text: string): MessageBuilder {
    this.setContents([newTextPart(text)]);
    return this;
  }

  setImageContent(
    uri: SimplePart["URI"],
    mime: SimplePart["MimeType"],
    detail?: SimplePart["Detail"],
  ): MessageBuilder {
    this.setContents([newImagePart(uri, mime, detail)]);
    return this;
  }

  appendContent(content: SimplePart): MessageBuilder {
    this.message.Contents.push(content);
    return this;
  }

  // Build the final message

  build(): SimpleMessage {
    return this.message;
  }
}
