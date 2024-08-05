import { CompletionSpan, OtherSpan, RetrievalSpan } from ".";
import type { EmbeddingsPayload } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type EmbeddingsSpanArgs = DerivedBaseSpanArgs & {
  inputs?: EmbeddingsPayload["Inputs"];
  options?: EmbeddingsPayload["Options"];
};

export class EmbeddingsSpan extends BaseSpan {
  familyData: EmbeddingsPayload = {
    Inputs: [],
    Options: {},
  };

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    attributes,
    inputs,
    options,
  }: EmbeddingsSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      attributes,
      family: "embeddings",
    });
    if (inputs) {
      this.familyData.Inputs = inputs;
    }
    if (options) {
      this.familyData.Options = options;
    }
  }

  end(embeddings: number[][]) {
    // TODO: store the embeddings in the familyData
    // this.familyData.Embeddings = embeddings || [];

    // for now, just log the embeddings
    console.log(
      "Ended with embeddings:",
      embeddings.map((e) => {
        // only return the first 5 embeddings
        return e.slice(0, 5);
      }),
    );

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
