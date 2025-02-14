import type { OtherFamilyData } from "../openapi";
import {
    BaseSpan,
    type DerivedBaseSpanArgs
} from "./span.base";

export type OtherSpanArgs = DerivedBaseSpanArgs;

export class OtherSpan extends BaseSpan {
    familyData: OtherFamilyData = {};

    constructor({
        name,
        traceId,
        parentId,
        message,
        severity,
        metadata,
    }: OtherSpanArgs) {
        super({
            name,
            traceId,
            parentId,
            message,
            severity,
            metadata,
            family: "unset",
        });
    }

    end() {
        this.maybeSetEndedAtToNow();
        return this;
    }
}
