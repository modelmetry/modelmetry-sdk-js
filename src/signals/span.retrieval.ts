import type { RetrievalPayload } from "../openapi";
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
    metadata,
    queries = [],
  }: RetrievalSpanArgs) {
    super({
      name,
      traceId,
      parentId,
      message,
      severity,
      metadata,
      family: "retrieval",
    });
    if (queries && queries.length > 0) {
      this.familyData.Queries = queries;
    }
  }

  end(retrieved: RetrievalPayload["Retrieved"]) {
    this.familyData.Retrieved = retrieved || [];
    this.maybeSetEndedAtToNow();
    return this;
  }
}
