import {
  type CompletionSpan,
  type CompletionSpanArgs,
  type EmbeddingsSpan,
  type EmbeddingsSpanArgs,
  type OtherSpan,
  type OtherSpanArgs,
  type RetrievalSpan,
  type RetrievalSpanArgs,
  type Span,
  type SpanTypeMap,
  createSpan,
  startSpan,
} from ".";
import type { FamilyData, schemas } from "../openapi";
import { getDateMax } from "../utils/dates";
import { Event } from "./event";
import { Finding } from "./finding";

export type BaseSpanArgs = {
  name: string;
  traceId: string;
  parentId?: string;
  message?: string;
  severity?: schemas["Span"]["Severity"];
  attributes?: schemas["Span"]["Attributes"];
  family?: schemas["Span"]["Family"];
};

export type DerivedBaseSpanArgs = Omit<BaseSpanArgs, "family">;

export abstract class BaseSpan {
  protected readonly xid: string;
  protected readonly traceId: string;
  protected readonly parentId?: string;
  protected name: string;
  protected message = "";
  protected startedAt: Date = new Date();
  protected endedAt: Date | undefined;
  protected severity: schemas["Span"]["Severity"] = "unset"; // unset debug warning error
  protected family: schemas["Span"]["Family"] = ""; // "" "embeddings" "retrieval" "completion"
  protected attributes: schemas["Span"]["Attributes"] = {};
  protected spans: Span[] = [];
  protected findings: Finding[] = [];
  protected events: Event[] = [];
  protected familyData: FamilyData = {};

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    family,
    attributes,
  }: BaseSpanArgs) {
    this.traceId = traceId;
    this.xid = crypto.randomUUID();
    this.parentId = parentId;
    this.name = name;
    this.severity = severity || "unset";
    this.message = message || "";
    this.family = family || "";
    this.attributes = attributes || {};
  }

  // findings

  appendSpan(span: Span) {
    this.spans.push(span);
    return span;
  }

  newFinding(
    name: Finding["name"],
    value: Finding["value"],
    opts: Partial<{
      comment?: Finding["comment"];
      description?: Finding["description"];
      metadata?: Finding["metadata"];
      source?: Finding["source"];
    }> = {},
  ): Finding {
    const finding = new Finding({
      name,
      value,
      traceId: this.traceId,
      spanId: this.xid,
      ...opts,
    });
    this.appendFinding(finding);
    return finding;
  }

  appendFinding(finding: Finding) {
    this.findings.push(finding);
    return this;
  }

  getFindings(): Finding[] {
    return this.findings;
  }

  // events

  newEvent(name: string): Event {
    const event = new Event({
      name,
      traceId: this.traceId,
      spanId: this.xid,
    });
    this.appendEvent(event);
    return event;
  }

  appendEvent(event: Event) {
    this.events.push(event);
    return this;
  }

  getEvents(): Event[] {
    return this.events;
  }

  errored(error: Error) {
    this.newEvent("errored");
    this.setSeverity("error");
    this.setMessage(error.message);
    this.setAttribute("error", error.message);
    this.setEndedAt(new Date());
  }

  // children spans

  getChildrenSpans(): Span[] {
    return this.spans;
  }

  getDescendantSpans(): Span[] {
    return this.spans.flatMap((span) => [span, ...span.getDescendantSpans()]);
  }

  // setters

  setFamily(family: schemas["Span"]["Family"]) {
    this.family = family;
    return this;
  }

  setSeverity(severity: schemas["Span"]["Severity"]) {
    this.severity = severity;
    return this;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }

  setAttribute(key: string, value: unknown) {
    this.attributes[key] = value;
    return this;
  }

  getAttribute(key: string) {
    return this.attributes[key];
  }

  mergeAttributes(attributes: schemas["Span"]["Attributes"]) {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  putAttributes(attributes: schemas["Span"]["Attributes"]) {
    this.attributes = { ...attributes };
    return this;
  }

  setEndedAtAutomatically() {
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

    // 3. if endedAt is set, ensure it is greater or equal to max endedAt across its children
    if (this.endedAt) {
      const childrenEndedAt = this.getChildrenSpans()
        .map((span) => span.getEndedAt())
        .filter((date) => date) as Date[];

      if (childrenEndedAt.length === 0) {
        return this;
      }

      const maxChildrenEndedAt = getDateMax(...childrenEndedAt);
      if (maxChildrenEndedAt > this.endedAt) {
        this.endedAt = maxChildrenEndedAt;
      }
    }

    return this;
  }

  setEndedAt(date: Date) {
    this.endedAt = date;
    return this;
  }

  maybeSetEndedAtToNow() {
    if (!this.endedAt) {
      this.setEndedAt(new Date());
    }
  }

  // getters

  getAttributes() {
    return this.attributes;
  }

  getFamily() {
    return this.family;
  }

  getFamilyData() {
    return this.familyData;
  }

  getSeverity() {
    return this.severity;
  }

  getStartedAt() {
    return this.startedAt;
  }

  getEndedAt() {
    return this.endedAt;
  }

  getMessage() {
    return this.message;
  }

  getName() {
    return this.name;
  }

  getXid() {
    return this.xid;
  }

  getTraceId() {
    return this.traceId;
  }

  getParentId() {
    return this.parentId;
  }

  toIngestParams(): schemas["CreateSpanParams"] {
    return {
      XID: this.xid,
      Name: this.name,
      Start: this.startedAt.toISOString(),
      End: this.endedAt?.toISOString() || new Date().toISOString(),
      Message: this.message,
      TraceID: this.traceId,
      Attributes: this.attributes,
      Family: this.family,
      FamilyData: this.familyData,
      ParentID: this.parentId,
      Severity: this.severity,
    };
  }

  span(
    name: string,
    kind: "completion",
    args: Partial<CompletionSpanArgs>,
  ): CompletionSpan;
  span(
    name: string,
    kind: "embeddings",
    args: Partial<EmbeddingsSpanArgs>,
  ): EmbeddingsSpan;
  span(
    name: string,
    kind: "retrieval",
    args: Partial<RetrievalSpanArgs>,
  ): RetrievalSpan;
  span(name: string, kind: "other", args: Partial<OtherSpanArgs>): OtherSpan;
  span(
    name: string,
    kind: "completion" | "embeddings" | "retrieval" | "other",
    args:
      | Partial<CompletionSpanArgs>
      | Partial<EmbeddingsSpanArgs>
      | Partial<RetrievalSpanArgs>
      | Partial<OtherSpanArgs>,
  ): Span {
    switch (kind) {
      case "completion":
        return createSpan(this, name, kind, args);
      case "embeddings":
        return createSpan(this, name, kind, args);
      case "retrieval":
        return createSpan(this, name, kind, args);
      case "other":
        return createSpan(this, name, kind, args);
    }
  }

  async startSpan<O, SpanKind extends keyof SpanTypeMap>(
    name: string,
    kind: SpanKind,
    callback: (span: SpanTypeMap[SpanKind]) => Promise<O>,
  ) {
    return startSpan(this, name, kind, callback);
  }
}
