import { CompletionSpan, EmbeddingsSpan, OtherSpan } from ".";
import type { EmbeddingsPayload, RetrievalPayload } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type RetrievalSpanArgs = DerivedBaseSpanArgs & {
  queries?: RetrievalPayload["Queries"];
};

export class RetrievalSpan extends BaseSpan {
  familyData: RetrievalPayload = {
    Queries: [],
    Retrieved: [],
  };

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    attributes,
    queries = [],
  }: RetrievalSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      attributes,
      family: "retrieval",
    });
    if (queries.length > 0) {
      this.familyData.Queries = queries;
    }
  }

  end(retrieved: RetrievalPayload["Retrieved"]) {
    this.familyData.Retrieved = retrieved || [];
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
