import { MessageBuilder } from "./message-builder";
import { newImagePart, newTextPart } from "../builders";
import { expect, test } from "vitest";
import type { ToolCall } from "..";

test("Create a message with system role", () => {
  const message = new MessageBuilder("system").build();
  expect(message.Role).toBe("system");
});

test("Create a message with assistant role", () => {
  const message = new MessageBuilder("assistant").build();
  expect(message.Role).toBe("assistant");
});

test("Create a message with user role", () => {
  const message = new MessageBuilder("user").build();
  expect(message.Role).toBe("user");
});

test("Set the tool call ID", () => {
  const message = new MessageBuilder("system")
    .setToolCallID("tool_123")
    .build();
  expect(message.ToolCallID).toBe("tool_123");
});

test("Set the name", () => {
  const message = new MessageBuilder("system").setName("Test Message").build();
  expect(message.Name).toBe("Test Message");
});

test("Add a tool call", () => {
  const toolCall: ToolCall = {
    ID: "tool_123", Type: "function", Function: {
      Arguments: [],
      Name: "test",
    }
  };
  const message = new MessageBuilder("system").addToolCall(toolCall).build();
  expect(message.ToolCalls).toContain(toolCall);
});

test("Set text content", () => {
  const message = new MessageBuilder("system")
    .setTextContent("Hello, world!")
    .build();
  expect(message.Contents).toEqual([newTextPart("Hello, world!")]);
});

test("Set image content", () => {
  const message = new MessageBuilder("system")
    .setImageContent("image.jpg", "image/jpeg", "high")
    .build();
  expect(message.Contents).toEqual([
    newImagePart("image.jpg", "image/jpeg", "high"),
  ]);
});

test("Append content", () => {
  const content1 = newTextPart("Text 1");
  const content2 = newImagePart("image.jpg", "image/jpeg");
  const message = new MessageBuilder("system")
    .appendContent(content1)
    .appendContent(content2)
    .build();
  expect(message.Contents).toEqual([content1, content2]);
});
