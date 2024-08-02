import type { Payload, SimpleMessage, SimpleOptions } from "..";
import { newInput, newOutput, newTextInput } from ".";

// we can have both input and output set
// but we cannot have both chat and text for either input or output
// therefore, we must ensure input/output have either chat or text before setting the other, 
// and throw an error if the other one is already set

type PayloadBuilderOptions = {
  unsetOther: boolean;
}

const defaultPayloadBuilderOptions: PayloadBuilderOptions = {
  unsetOther: true,
}

export class PayloadBuilder {
  private payload: Payload = {};
  private options: PayloadBuilderOptions;

  constructor(options: Partial<PayloadBuilderOptions> = defaultPayloadBuilderOptions) {
    this.options = { ...defaultPayloadBuilderOptions, ...options };
  }

  // Input

  setInputText(text: string): PayloadBuilder {
    if (this.hasInputChat()) {
      if (this.options.unsetOther) {
        this.payload.Input = undefined;
      } else {
        throw new Error("Input already set to chat. Cannot set text input.");
      }
    }

    this.payload.Input = newInput(newTextInput(text));
    return this;
  }

  setInputChat(
    messages: SimpleMessage[] = [],
    settings: SimpleOptions = {},
  ): PayloadBuilder {
    if (this.hasInputText()) {
      if (this.options.unsetOther) {
        this.payload.Input = undefined;
      } else {
        throw new Error("Input already set to text. Cannot set chat input.");
      }
    }

    this.payload.Input = newInput({
      Messages: messages,
      Settings: settings,
    });
    return this;
  }

  hasInputText(): boolean {
    return "Text" in (this.payload?.Input ?? {}) || false;
  }

  hasInputChat(): boolean {
    return "Chat" in (this.payload?.Input ?? {}) || false;
  }

  // Output

  setOutputText(text: string): PayloadBuilder {
    if (this.hasOutputChat()) {
      if (this.options.unsetOther) {
        this.payload.Output = undefined;
      } else {
        throw new Error("Output already set to chat. Cannot set text output.");
      }
    }

    this.payload.Output = newOutput(newTextInput(text));
    return this;
  }

  setOutputChat(
    messages: SimpleMessage[] = [],
    settings: SimpleOptions = {},
  ): PayloadBuilder {
    if (this.hasOutputText()) {
      if (this.options.unsetOther) {
        this.payload.Output = undefined;
      } else {
        throw new Error("Output already set to text. Cannot set chat output.");
      }
    }

    this.payload.Output = newOutput({
      Messages: messages,
      Settings: settings,
    });
    return this;
  }

  hasOutputText(): boolean {
    return "Text" in (this.payload?.Output ?? {}) || false;
  }

  hasOutputChat(): boolean {
    return "Chat" in (this.payload?.Output ?? {}) || false
  }

  build(): Payload {
    if (!this.payload.Input && !this.payload.Output) {
      throw new Error("Payload must have either input or output");
    }
    return this.payload;
  }
}

// always-valid entity/object