import { expect, test } from "vitest";
import type { SimpleMessage } from "..";
import { newMessages, newTextMessage, newTextPart } from ".";
import { PayloadBuilder } from "./payload-builder";

test("should set input text", () => {
  const builder = new PayloadBuilder();
  const text = "Hello, world!";
  builder.setInputText(text);
  expect(builder.hasInputText()).toBe(true);
  expect(builder.hasInputChat()).toBe(false);

  const payload = builder.build();
  expect(payload.Input?.Text).toStrictEqual({
    Text: text,
  });
});

test("should set input chat", () => {
  const builder = new PayloadBuilder();
  const messages = newMessages(newTextMessage("system", "Hello, world!"));
  builder.setInputChat(messages, {});
  expect(builder.hasInputText()).toBe(false);
  expect(builder.hasInputChat()).toBe(true);

  const payload = builder.build();
  expect(payload.Input?.Chat).toStrictEqual({
    Messages: messages,
    Settings: {},
  });
});

test("should throw when setting text input if input is already set to chat", () => {
  const builder = new PayloadBuilder({
    unsetOther: false,
  });
  builder.setInputChat();
  expect(() => builder.setInputText("Hello")).toThrow();
});

test("should unset chat input when setting text input if input is already set to chat", () => {
  const builder = new PayloadBuilder({ unsetOther: true });
  builder.setInputChat();
  expect(builder.hasInputChat()).toBe(true);

  builder.setInputText("Hello");
  expect(builder.hasInputText()).toBe(true);
  expect(builder.hasInputChat()).toBe(false);
})

test("should throw when setting chat input if input is already set to text", () => {
  const builder = new PayloadBuilder({
    unsetOther: false,
  });
  builder.setInputText("Hello");
  expect(() => builder.setInputChat()).toThrow();
});

test("should unset text input when setting chat input if input is already set to text", () => {
  const builder = new PayloadBuilder({ unsetOther: true });
  builder.setInputText("Hello");
  builder.setInputChat();
  expect(builder.hasInputText()).toBe(false);
  expect(builder.hasInputChat()).toBe(true);
})

test("should set output text", () => {
  const builder = new PayloadBuilder();
  const text = "Hello, world!";
  builder.setOutputText(text);
  expect(builder.hasOutputText()).toBe(true);
  expect(builder.hasOutputChat()).toBe(false);

  const payload = builder.build();
  expect(payload.Output?.Text).toStrictEqual({
    Text: text,
  });
});

test("should set output chat", () => {
  const builder = new PayloadBuilder();
  const messages = newMessages(
    newTextMessage("system", "Hello, world!"),
    newTextMessage("system", "Goodbye!"),
  )

  builder.setOutputChat(messages, {});
  expect(builder.hasOutputText()).toBe(false);
  expect(builder.hasOutputChat()).toBe(true);

  const payload = builder.build();
  expect(payload.Output?.Chat).toStrictEqual({
    Messages: messages,
    Settings: {},
  });
});

test("should throw when setting text output if output is already set to chat", () => {
  const builder = new PayloadBuilder({
    unsetOther: false,
  });
  builder.setOutputChat();
  expect(() => builder.setOutputText("Hello")).toThrow();
});

test("should throw when setting chat output if output is already set to text", () => {
  const builder = new PayloadBuilder({
    unsetOther: false,
  });
  builder.setOutputText("Hello");
  expect(() => builder.setOutputChat()).toThrow();
});

test("should throw when building payload without input or output", () => {
  const builder = new PayloadBuilder();
  expect(() => builder.build()).toThrow();
});
