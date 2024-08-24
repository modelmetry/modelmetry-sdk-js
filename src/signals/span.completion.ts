import merge from "lodash.merge";
import {
  type CompletionFamilyData,
  type Message,
  newUsageValue,
  type schemas,
} from "../openapi";
import type { PartialExcept, RecursivePartial } from "../typings";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type CompletionSpanArgs = DerivedBaseSpanArgs & {
  options?: CompletionFamilyData["Options"];
};

export class CompletionSpan extends BaseSpan {
  familyData: CompletionFamilyData = {};

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    metadata,
    options,
  }: CompletionSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      metadata,
      family: "completion",
    });
    if (options) {
      this.familyData.Options = options;
    }
  }

  setOption<
    K extends keyof NonNullable<CompletionFamilyData["Options"]>,
    V extends NonNullable<CompletionFamilyData["Options"]>[K],
  >(key: K, value: V) {
    this.familyData.Options = this.familyData.Options || {};
    this.familyData.Options[key] = value;
    return this;
  }

  unsetOption<K extends keyof NonNullable<CompletionFamilyData["Options"]>>(
    key: K,
  ) {
    this.familyData.Options = this.familyData.Options || {};
    delete this.familyData.Options[key];
    return this;
  }

  setModel(model: string) {
    this.setOption("Model", model);
    return this;
  }

  setProvider(provider: string) {
    this.setOption("Provider", provider);
    return this;
  }

  setInput(input: CompletionFamilyData["Input"]) {
    this.familyData.Input = input;
    return this;
  }

  setInputText(input: string) {
    this.setInput({ Text: input });
    return this;
  }

  setInputMessages(messages: Message[]) {
    this.setInput({ Messages: messages });
    return this;
  }

  setOutput(output: CompletionFamilyData["Output"]) {
    this.familyData.Output = output;
    return this;
  }

  setOutputText(output: string) {
    this.familyData.Output = this.familyData.Output || {};
    this.familyData.Output.Text = output;
    return this;
  }

  setOutputMessages(messages: Message[]) {
    this.setOutput({ Messages: messages });
    return this;
  }

  setUsage(
    kind: "input" | "output" | "total",
    amount: number,
    unit: "tokens" = "tokens",
  ) {
    this.familyData.Usage = this.familyData.Usage || {};

    switch (kind) {
      case "input":
        this.familyData.Usage.Input = newUsageValue(amount, unit);
        break;
      case "output":
        this.familyData.Usage.Output = newUsageValue(amount, unit);
        break;
      case "total":
        this.familyData.Usage.Total = newUsageValue(amount, unit);
        break;
    }
    return this;
  }

  setCost(
    kind: "input" | "output" | "total",
    amount: number,
    currency = "USD",
  ) {
    this.familyData.Cost = this.familyData.Cost || {};

    switch (kind) {
      case "input":
        this.familyData.Cost.Input = { Amount: amount, Currency: currency };
        break;
      case "output":
        this.familyData.Cost.Output = { Amount: amount, Currency: currency };
        break;
      case "total":
        this.familyData.Cost.Total = { Amount: amount, Currency: currency };
        break;
    }
    return this;
  }

  addDocument(data: PartialExcept<NonNullable<schemas["CompletionFamilyData"]["Documents"]>[number], "Identifier" | "Title" | "ContentType">) {
    this.familyData.Documents = this.familyData.Documents || [];
    this.familyData.Documents.push({ ...data });
    return this;
  }

  end(data: RecursivePartial<CompletionFamilyData> = {}) {
    this.familyData = merge(this.familyData, data);
    this.maybeSetEndedAtToNow();
    return this;
  }
}
