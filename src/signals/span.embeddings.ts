import type { EmbeddingsFamilyData } from "../openapi";
import { BaseSpan, type DerivedBaseSpanArgs } from "./span.base";

export type EmbeddingsSpanArgs = DerivedBaseSpanArgs & {
    inputs?: EmbeddingsFamilyData["Inputs"];
    options?: EmbeddingsFamilyData["Options"];
};

export class EmbeddingsSpan extends BaseSpan {
    familyData: EmbeddingsFamilyData = {
        Inputs: [],
        Options: {},
    };

    constructor({
        name,
        traceId,
        parentId,
        message,
        severity,
        metadata,
        inputs,
        options,
    }: EmbeddingsSpanArgs) {
        super({
            name,
            traceId,
            parentId,
            message,
            severity,
            metadata,
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
}
