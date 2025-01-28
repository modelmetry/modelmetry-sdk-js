import type { schemas } from "../openapi";
import type { Span } from ".";

export class Event {
    private readonly xid: string;
    private name = "";
    private at: Date = new Date();
    private metadata: schemas["Event"]["Metadata"] = {};
    private traceId?: string;
    private spanId?: string;

    constructor({
        name,
        traceId,
        spanId,
        at,
        metadata,
    }: {
        name: string;
        traceId?: string;
        spanId?: string;
        at?: Date;
        metadata?: schemas["Event"]["Metadata"];
    }) {
        this.xid = crypto.randomUUID();
        this.name = name;
        this.traceId = traceId;
        this.spanId = spanId;

        if (at) {
            this.at = at;
        }

        if (metadata) {
            this.metadata = metadata;
        }
    }

    setMetadata(key: string, value: string): Event {
        this.metadata[key] = value;
        return this;
    }

    mergeMetadata(metadata: schemas["Event"]["Metadata"]): Event {
        this.metadata = { ...this.metadata, ...metadata };
        return this;
    }

    putMetadata(metadata: schemas["Event"]["Metadata"]): Event {
        this.metadata = { ...metadata };
        return this;
    }

    static fromSpan(span: Span, name: string): Event {
        const event = new Event({
            name,
            traceId: span.getTraceId(),
            spanId: span.getXid(),
        });
        return event;
    }

    toIngestParams(): schemas["CreateEventParams"] {
        return {
            XID: this.xid,
            Name: this.name,
            At: this.at.toISOString(),
            Metadata: this.metadata,
            TraceID: this.traceId,
            SpanID: this.spanId,
            EntryID: null,
        };
    }
}
