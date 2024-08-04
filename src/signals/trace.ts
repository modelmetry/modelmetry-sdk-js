import type { schemas } from "../openapi";
import { getDateMax } from "../utils/dates";
import { Event } from "./event";
import { Finding } from "./finding";
import { Span } from "./span";

export class Trace {
  private readonly xid: string;
  private readonly tenantId: string;
  private name = "";
  private attributes: schemas["TraceWithSpans"]["Attributes"] = {};
  private startedAt: Date = new Date();
  private endedAt: Date | undefined;

  private spans: Span[] = [];
  private events: Event[] = [];
  private findings: Finding[] = [];

  constructor({
    name,
    tenantId,
    attributes,
  }: {
    name: string;
    tenantId: string;
    attributes?: schemas["TraceWithSpans"]["Attributes"];
  }) {
    this.xid = crypto.randomUUID();
    this.tenantId = tenantId;
    this.name = name;
    this.attributes = attributes || {};
    this.startedAt = new Date();
  }

  // events

  newEvent(name: string): Event {
    const event = new Event({
      name,
      traceId: this.xid,
    });
    this.appendEvent(event);
    return event;
  }

  appendEvent(event: Event): Trace {
    this.events.push(event);
    return this;
  }

  getEvents(): Event[] {
    return this.events;
  }

  // findings

  newFinding(name: Finding["name"], value: Finding["value"], opts: Partial<{
    comment?: Finding["comment"];
    description?: Finding["description"];
    metadata?: Finding["metadata"];
    source?: Finding["source"];
  }> = {}): Finding {
    const finding = new Finding({
      name,
      value,
      traceId: this.xid,
      ...opts,
    });
    this.appendFinding(finding);
    return finding;
  }

  appendFinding(finding: Finding): Trace {
    this.findings.push(finding);
    return this;
  }

  getFindings(): Finding[] {
    return this.findings;
  }

  // spans

  setEndedAtAutomatically(): Trace {
    // 1. loop through all children spans and set their endedAt (if they don't have one)
    for (const span of this.getChildrenSpans()) {
      span.setEndedAtAutomatically();
    }

    // 2. if this span does not already have an endedAt, set it to the max of all children spans' endedAt
    if (!this.endedAt) {
      const childrenEndedAt = this.getChildrenSpans()
        .map((span) => span.getEndedAt())
        .filter((date) => date) as Date[];

      if (childrenEndedAt.length === 0) {
        this.endedAt = new Date();
        return this;
      }

      const maxChildrenEndedAt = getDateMax(...childrenEndedAt);
      this.endedAt = maxChildrenEndedAt;
    }

    return this;
  }

  getChildrenSpans(): Span[] {
    return this.spans;
  }

  getDescendantSpans(): Span[] {
    return this.spans.flatMap((span) => [span, ...span.getDescendantSpans()]);
  }

  end(): Trace {
    if (!this.endedAt) {
      this.endedAt = new Date();
    }
    return this;
  }

  newSpan(name: string): Span {
    const span = new Span({
      traceId: this.xid,
      name,
    });
    span.setFamily("unset");
    this.spans.push(span);
    return span;
  }

  newEmbeddingsSpan(name: string): Span {
    return this.newSpan(name).setFamily("embeddings");
  }

  newRetrievalSpan(name: string): Span {
    return this.newSpan(name).setFamily("retrieval");
  }

  newCompletionSpan(name: string): Span {
    return this.newSpan(name).setFamily("completion");
  }

  getEndedAt() {
    return this.endedAt;
  }

  hasEnded() {
    return this.endedAt !== undefined;
  }

  getStartedAt() {
    return this.startedAt;
  }

  getAttributes() {
    return this.attributes;
  }

  getName() {
    return this.name;
  }

  getXid() {
    return this.xid;
  }

  getTenantId() {
    return this.tenantId;
  }

  getDurationInMilliseconds(): number {
    if (!this.endedAt) {
      return 0;
    }
    return this.endedAt.getTime() - this.startedAt.getTime();
  }

  getSpansCount(): number {
    return this.spans.length;
  }

  getDescendantSpansCount(): number {
    return this.getDescendantSpans().length;
  }

  getSpans(): Span[] {
    return this.spans;
  }

  toIngestParams(): schemas["CreateTraceParams"] {
    return {
      XID: this.xid,
      Name: this.name,
      Start: this.startedAt.toISOString(),
      End: this.endedAt?.toISOString(),
      Attributes: this.attributes,
      SessionID: null,
    };
  }
}
