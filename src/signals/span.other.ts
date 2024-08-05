import type { EmbeddingsPayload, OtherPayload } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";
import { CompletionSpan } from "./span.completion";
import { EmbeddingsSpan } from "./span.embeddings";
import { RetrievalSpan } from "./span.retrieval";

export type OtherSpanArgs = DerivedBaseSpanArgs;

export class OtherSpan extends BaseSpan {
  familyData: OtherPayload = {};

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    attributes,
  }: OtherSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      attributes,
      family: "unset",
    });
  }

  end() {
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
