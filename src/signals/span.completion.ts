import type { CompletionPayload } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type CompletionSpanArgs = DerivedBaseSpanArgs & {
  options?: CompletionPayload["Options"];
};

export class CompletionSpan extends BaseSpan {
  familyData: CompletionPayload = {
    Model: "",
    Options: {},
    Input: {},
    Output: {},
  };

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    attributes,
    options,
  }: CompletionSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      attributes,
      family: "completion",
    });
    if (options) {
      this.familyData.Options = options;
    }
  }

  setModel(model: string) {
    this.familyData.Model = model;
    return this;
  }

  setInput(input: CompletionPayload["Input"]) {
    this.familyData.Input = input;
    return this;
  }

  setOutput(output: CompletionPayload["Output"]) {
    this.familyData.Output = output;
    return this;
  }

  end(data: Partial<CompletionPayload>) {
    this.familyData.Model = data.Model || "";
    this.familyData.Input = data.Input || {};
    this.familyData.Output = data.Output || {};
    this.maybeSetEndedAtToNow();
    return this;
  }
}
