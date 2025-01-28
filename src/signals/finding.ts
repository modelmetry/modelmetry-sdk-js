import type { schemas } from "../openapi";

export class Finding {
    private readonly xid: string;
    private name: string;
    private value: number | boolean | string;

    private traceId?: string;
    private spanId?: string;
    private description?: string;
    private source: schemas["Finding"]["Source"] = "sdk";
    private comment?: string;
    private metadata?: schemas["Finding"]["Metadata"];
    private at: Date = new Date();

    constructor({
        name,
        value,
        traceId,
        spanId,
        description,
        source,
        comment,
        metadata,
        at,
    }: {
        name: string;
        value: number | boolean | string;
        traceId?: string;
        spanId?: string;
        description?: string;
        source?: schemas["Finding"]["Source"];
        comment?: string;
        metadata?: schemas["Finding"]["Metadata"];
        at?: Date;
    }) {
        this.xid = crypto.randomUUID();
        this.name = name;
        this.value = value;
        this.traceId = traceId;
        this.spanId = spanId;
        this.description = description;
        this.source = source || "sdk";
        this.comment = comment;
        this.metadata = metadata;
        if (at) {
            this.at = at;
        }
    }

    toIngestParams(): schemas["CreateFindingParams"] {
        return {
            XID: this.xid,
            Name: this.name,
            Value: this.value,
            Comment: this.comment,
            Description: this.description,
            Source: this.source || "sdk",
            At: this.at.toISOString(),
            Metadata: this.metadata || {},
            TraceID: this.traceId,
            SpanID: this.spanId,
            EntryID: null,
        };
    }
}
