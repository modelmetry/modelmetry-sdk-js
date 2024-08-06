import type { OtherPayload } from "../openapi";
import {
  BaseSpan,
  type DerivedBaseSpanArgs
} from "./span.base";

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
}
