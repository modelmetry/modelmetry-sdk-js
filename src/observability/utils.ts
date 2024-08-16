import type { Event, Finding, IngestBatch, Trace } from "../signals";

export const calculateKilobyteSize = (input: unknown): number => {
  return calculcateByteSize(input) / 1024;
}

export const calculcateByteSize = (input: unknown): number => {
  const str = JSON.stringify(input);
  return new TextEncoder().encode(str).length;
}

export const buildIngestBatchFromTraces = (traces: Trace[]): IngestBatch => {
  for (const trace of traces) {
    trace.setEndedAtAutomatically();
  }

  const batch: IngestBatch = {
    Events: [],
    Findings: [],
    Sessions: [],
    Traces: [],
    Spans: [],
  };

  // add all traces
  for (const trace of traces) {
    batch.Traces?.push(trace.toIngestParams());
  }

  // add the spans
  for (const trace of traces) {
    const spans = trace.getDescendantSpans();
    for (const span of spans) {
      batch.Spans?.push(span.toIngestParams());
    }
  }

  // add the events
  const events = gatherAllEventsRecursively(traces);
  for (const event of events) {
    batch.Events?.push(event.toIngestParams());
  }

  // add the findings
  const findings = gatherAllFindingsRecursively(traces);
  for (const finding of findings) {
    batch.Findings?.push(finding.toIngestParams());
  }

  return batch;
};

export const gatherAllEventsRecursively = (traces: Trace[]): Event[] => {
  const events: Event[] = [];
  for (const trace of traces) {
    events.push(...trace.getEvents());
    const spans = trace.getDescendantSpans();
    for (const span of spans) {
      events.push(...span.getEvents());
    }
  }
  return events;
};

export const gatherAllFindingsRecursively = (traces: Trace[]): Finding[] => {
  const findings: Finding[] = [];
  for (const trace of traces) {
    findings.push(...trace.getFindings());
    const spans = trace.getDescendantSpans();
    for (const span of spans) {
      findings.push(...span.getFindings());
    }
  }
  return findings;
};
