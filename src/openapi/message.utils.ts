import type { AssistantMessage, SystemMessage, ToolMessage, UserMessage } from ".";

export const newUserMessage = (content: string): UserMessage => {
    return {
        Role: "user",
        Contents: [{ Text: content }],
    };
};

export const newAssistantMessage = (content: string): AssistantMessage => {
    return {
        Role: "assistant",
        Contents: [{ Text: content }],
    };
};

export const newSystemMessage = (content: string): SystemMessage => {
    return {
        Role: "system",
        Contents: [{ Text: content }],
    };
}

export const newToolMessage = (toolCallId: string, content: string): ToolMessage => {
    return {
        Role: "tool",
        ToolCallID: toolCallId,
        Contents: [{ Text: content }],
    };
}
