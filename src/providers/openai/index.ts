import type OpenAI from "openai";
import type { DataPart, Message, Part, schemas, TextPart } from "../../openapi";

export const fromOpenaiMessages = (
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
) => messages.map((m) => fromOpenaiMessage(m));

export const fromOpenaiMessage = (
    input: OpenAI.Chat.ChatCompletionMessageParam,
): Message => {
    switch (input.role) {

        case "assistant": {
            const message: schemas["AssistantMessage"] = {
                Role: "assistant",
                Contents: typeof input.content === "string" ? [{ Text: String(input.content) }] : [],
                ToolCalls: input.tool_calls ? input.tool_calls.map(fromOpenaiToolCall) : undefined,
                Name: input.name,
            };
            return message
        }

        case "system": {
            const message: schemas["SystemMessage"] = {
                Role: "system",
                Contents: typeof input.content === "string" ? [{ Text: String(input.content) }] : [],
                Name: input.name,
            };
            return message
        }

        case "user": {
            const message: schemas["UserMessage"] = {
                Role: "user",
                Contents: [],
                Name: input.name,
            };

            if (typeof input.content === "string") {
                message.Contents?.push({ Text: String(input.content) });
            } else if (Array.isArray(input.content)) {
                message.Contents = input.content.map(fromOpenaiChatCompletionContentPart);
            }

            return message
        }

        case "tool": {
            const message: schemas["ToolMessage"] = {
                Role: "tool",
                ToolCallID: input.tool_call_id,
                Contents: [],
            }

            if (typeof input.content === "string") {
                message.Contents.push({ Text: String(input.content) });
            } else {
                message.Contents = input.content.map(fromOpenaiChatCompletionContentPart);
            }

            return message;
        }

        case "function": {
            const message: schemas["ToolMessage"] = {
                Role: "tool",
                ToolCallID: input.name,
                Contents: [
                    { Text: String(input.content) },
                ],
            }
            return message;
        }
    }
};

export const fromOpenaiToolCall = (
    input: OpenAI.Chat.ChatCompletionMessageToolCall,
): schemas["ToolCall"] => {
    const call: schemas["ToolCall"] = {
        ID: input.id,
        Type: input.type,
        Function: {
            Name: input.function.name,
            Arguments: input.function.arguments,
        },
    }
    return call;
}

export const fromOpenaiChatCompletionContentPart = (
    input: OpenAI.Chat.ChatCompletionContentPart,
): Part => {
    if ("text" in input) {
        return fromOpenaiChatCompletionContentPartText(input);
    }
    if ("image_url" in input) {
        return fromOpenaiChatCompletionContentPartImage(input);
    }
    throw new Error("Invalid ChatCompletionContentPart");
}

export const fromOpenaiChatCompletionContentPartText = (
    input: OpenAI.Chat.ChatCompletionContentPartText,
): TextPart => {
    const part: TextPart = {
        Text: input.text,
    }
    return part;
}

export const fromOpenaiChatCompletionContentPartImage = (
    input: OpenAI.Chat.ChatCompletionContentPartImage,
): DataPart => {
    const part: DataPart = {
        MimeType: input.type,
        Data: input.image_url.url,
        Detail: input.image_url.detail,
    }
    return part;
}