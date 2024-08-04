import type { FamilyData, schemas } from "../openapi";
import { getDateMax } from "../utils/dates";
import { Event } from "./event";
import { Finding } from "./finding";

export class Span {
  private readonly xid: string;
  private readonly traceId: string;
  private readonly parentId?: string;
  private name: string;
  private message = "";
  private startedAt: Date = new Date();
  private endedAt: Date | undefined;
  private severity: schemas["Span"]["Severity"] = "unset"; // unset debug warning error
  private family: schemas["Span"]["Family"] = ""; // "" "embeddings" "retrieval" "completion"
  private attributes: schemas["Span"]["Attributes"] = {};
  private familyData: FamilyData = {};

  private spans: Span[] = [];
  private findings: Finding[] = [];
  private events: Event[] = [];

  constructor({
    name,
    traceId,
    parentId,
    message,
    severity,
    family,
    attributes,
    familyData,
  }: {
    traceId: string;
    name: string;
    parentId?: string;
    message?: string;
    severity?: schemas["Span"]["Severity"];
    attributes?: schemas["Span"]["Attributes"];
    family?: schemas["Span"]["Family"];
    familyData?: FamilyData;
  }) {
    this.traceId = traceId;
    this.xid = crypto.randomUUID();
    this.parentId = parentId;
    this.name = name;
    this.severity = severity || "unset";
    this.message = message || "";
    this.family = family || "";
    this.familyData = familyData || {};
    this.attributes = attributes || {};
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
      traceId: this.traceId,
      spanId: this.xid,
      ...opts,
    });
    this.appendFinding(finding);
    return finding;
  }

  appendFinding(finding: Finding): Span {
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

  appendEvent(event: Event): Span {
    this.events.push(event);
    return this;
  }

  getEvents(): Event[] {
    return this.events;
  }

  // children spans

  getChildrenSpans(): Span[] {
    return this.spans;
  }

  getDescendantSpans(): Span[] {
    return this.spans.flatMap((span) => [span, ...span.getDescendantSpans()]);
  }

  newSpan(name: string): Span {
    const span = new Span({
      name,
      traceId: this.traceId,
      parentId: this.xid,
      family: "unset",
      familyData: {},
    });
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

  // setters

  setFamily(family: schemas["Span"]["Family"]): Span {
    this.family = family;
    return this;
  }

  setSeverity(severity: schemas["Span"]["Severity"]): Span {
    this.severity = severity;
    return this;
  }

  setMessage(message: string): Span {
    this.message = message;
    return this;
  }

  setFamilyData(familyData: FamilyData): Span {
    this.familyData = familyData;
    return this;
  }

  setAttribute(key: string, value: string): Span {
    this.attributes[key] = value;
    return this;
  }

  mergeAttributes(attributes: schemas["Span"]["Attributes"]): Span {
    this.attributes = { ...this.attributes, ...attributes };
    return this;
  }

  putAttributes(attributes: schemas["Span"]["Attributes"]): Span {
    this.attributes = { ...attributes };
    return this;
  }

  setEndedAtAutomatically(): Span {
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

  setEndedAtAutomaticallyRecursively(): Span {
    return this;
  }

  setEndedAt(date: Date): Span {
    this.endedAt = date;
    return this;
  }

  // getters

  getAttributes() {
    return this.attributes;
  }

  getFamily() {
    return this.family;
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

  getFamilyData() {
    return this.familyData;
  }

  // endings

  end({
    error,
    message,
  }: {
    error?: Error;
    message?: string;
  } = {}) {
    this.message = message || "";

    if (!this.endedAt) {
      this.setEndedAt(new Date());
    }

    if (error) {
      this.severity = "error";
    }
  }

  endWithError(error: Error) {
    this.end({ error });
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
}
