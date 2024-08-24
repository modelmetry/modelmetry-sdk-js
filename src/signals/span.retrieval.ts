import type { RetrievalFamilyData, schemas } from "../openapi";
import type { PartialExcept } from "../typings";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type RetrievalSpanArgs = DerivedBaseSpanArgs & {
  queries?: RetrievalFamilyData["Queries"];
};

export class RetrievalSpan extends BaseSpan {
  familyData: RetrievalFamilyData = {
    Queries: [],
    Documents: [],
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

  addDocument(
    doc: PartialExcept<
      NonNullable<RetrievalFamilyData["Documents"]>[number],
      "Identifier" | "Title" | "ContentType"
    >,
  ) {
    this.familyData.Documents = this.familyData.Documents || [];
    this.familyData.Documents.push({ ...doc });
    return this;
  }

  addQuery(query: NonNullable<RetrievalFamilyData["Queries"]>[number]) {
    this.familyData.Queries = this.familyData.Queries || [];
    this.familyData.Queries.push({ ...query });
  }

  end({ docs }: { docs?: RetrievalFamilyData["Documents"] } = {}) {
    if (Array.isArray(docs)) {
      for (const doc of docs) {
        this.addDocument(doc);
      }
    }
    this.maybeSetEndedAtToNow();
    return this;
  }
}
