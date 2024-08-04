import type { schemas } from "../openapi";
import type { Span } from "./span";

export class Event {
  private readonly xid: string;
  private name = "";
  private at: Date = new Date();
  private attributes: schemas["Event"]["Attributes"] = {};
  private traceId?: string;
  private spanId?: string;

  constructor({
    name,
    traceId,
    spanId,
    at,
    attributes,
  }: {
    name: string;
    traceId?: string;
    spanId?: string;
    at?: Date;
    attributes?: schemas["Event"]["Attributes"];
  }) {
    this.xid = crypto.randomUUID();
    this.name = name;
    this.traceId = traceId;
    this.spanId = spanId;

    if (at) {
      this.at = at;
    }

    if (attributes) {
      this.attributes = attributes;
    }
  }

  setAttribute(key: string, value: string): Event {
    this.attributes[key] = value;
    return this;
  }

  mergeAttributes(attributes: schemas["Event"]["Attributes"]): Event {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  putAttributes(attributes: schemas["Event"]["Attributes"]): Event {
    this.attributes = { ...attributes };
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
      Attributes: this.attributes,
      TraceID: this.traceId,
      SpanID: this.spanId,
      EntryID: null,
    };
  }
}
