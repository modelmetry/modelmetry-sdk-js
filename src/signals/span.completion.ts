import type { CompletionPayload, EmbeddingsPayload } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";
import { EmbeddingsSpan } from "./span.embeddings";
import { OtherSpan } from "./span.other";
import { RetrievalSpan } from "./span.retrieval";

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


  newSpan(name: string): OtherSpan {
    const span = new OtherSpan({
      name,
      traceId: this.traceId,
      parentId: this.xid,
    });
    this.spans.push(span);
    return span;
  }

  newEmbeddingsSpan(
    name: string,
    inputs?: EmbeddingsPayload["Inputs"],
    options?: EmbeddingsPayload["Options"],
  ): EmbeddingsSpan {
    const span = new EmbeddingsSpan({
      name,
      traceId: this.traceId,
      parentId: this.xid,
      options,
      inputs,
    });
    this.spans.push(span);
    return span;
  }

  newRetrievalSpan(name: string): RetrievalSpan {
    const span = new RetrievalSpan({
      name,
      traceId: this.traceId,
      parentId: this.xid,
    });
    this.spans.push(span);
    return span;
  }

  newCompletionSpan(name: string): CompletionSpan {
    const span = new CompletionSpan({
      name,
      traceId: this.traceId,
      parentId: this.xid,
    });
    this.spans.push(span);
    return span;
  }
}
