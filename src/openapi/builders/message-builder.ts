import { newImagePart, newTextPart } from ".";
import type {
  SimpleMessage,
  SimplePart,
  ToolCall
} from "..";

export const newTextMessage = (role: SimpleMessage["Role"], text: string): SimpleMessage => ({
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

  setImageContent(uri: SimplePart["URI"], mime: SimplePart["MimeType"], detail?: SimplePart["Detail"]): MessageBuilder {
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
