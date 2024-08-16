/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/calls": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** CallGuardrail */
        post: operations["call-guardrail"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/signals/ingest/v1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Ingest signals (v1) */
        post: operations["ingest-signals-v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AssistantMessage: {
            Contents: (components["schemas"]["TextPart"] | components["schemas"]["DataPart"])[] | null;
            Name?: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            Role: "assistant";
            ToolCalls?: components["schemas"]["ToolCall"][] | null;
        };
        Call: {
            /**
             * Format: uri
             * @description A URL to the JSON Schema for this object.
             */
            readonly $schema?: string;
            /** Format: date-time */
            CreatedAt: string;
            CreatedBy: string;
            /** Format: int64 */
            DurationMs: number;
            GuardrailID: string;
            ID: string;
            Metadata: {
                [key: string]: unknown;
            };
            /** @enum {string} */
            Outcome: "pass" | "fail" | "error";
            Payload: components["schemas"]["Payload"];
            SummarisedEntries: components["schemas"]["SummarisedEntry"][] | null;
            TenantID: string;
            /** Format: date-time */
            UpdatedAt: string;
            UpdatedBy: string;
        };
        CallGuardrailRequestBody: {
            /**
             * Format: uri
             * @description A URL to the JSON Schema for this object.
             */
            readonly $schema?: string;
            GuardrailID: string;
            Payload: components["schemas"]["Payload"];
            TenantID: string;
        };
        ChatInput: {
            Messages?: (components["schemas"]["SystemMessage"] | components["schemas"]["UserMessage"] | components["schemas"]["AssistantMessage"] | components["schemas"]["ToolMessage"])[] | null;
            Options: components["schemas"]["Options"];
        };
        CreateEventParams: {
            /** Format: date-time */
            At?: string | null;
            Attributes?: {
                [key: string]: unknown;
            };
            EntryID?: string | null;
            Name: string;
            SpanID?: string | null;
            TraceID?: string | null;
            XID: string;
        };
        CreateFindingParams: {
            /** Format: date-time */
            At?: string | null;
            Comment?: string | null;
            Description?: string | null;
            EntryID?: string | null;
            Metadata?: {
                [key: string]: unknown;
            };
            Name: string;
            /** @enum {string|null} */
            Source?: "annotation" | "api" | "enduser" | "evaluator" | null;
            SpanID?: string | null;
            TraceID?: string | null;
            Value: number | boolean | string;
            XID: string;
        };
        CreateSessionParams: {
            Attributes?: {
                [key: string]: unknown;
            };
            Name?: string | null;
            XID: string;
        };
        CreateSpanParams: {
            Attributes?: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            End: string | null;
            Family?: string | null;
            FamilyData?: unknown;
            Message?: string | null;
            Name: string;
            ParentID?: string | null;
            Severity?: string | null;
            /** Format: date-time */
            Start: string;
            TraceID: string;
            XID: string;
        };
        CreateTraceParams: {
            Attributes?: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            End?: string | null;
            Name?: string | null;
            SessionID?: string | null;
            /** Format: date-time */
            Start: string;
            XID: string;
        };
        DataPart: {
            /** @enum {string} */
            Detail?: "auto" | "low" | "high";
            MimeType: string;
            URI: string;
        };
        ErrorDetail: {
            /** @description Where the error occurred, e.g. 'body.items[3].tags' or 'path.thing-id' */
            location?: string;
            /** @description Error message text */
            message?: string;
            /** @description The value at the given location */
            value?: unknown;
        };
        ErrorModel: {
            /**
             * Format: uri
             * @description A URL to the JSON Schema for this object.
             */
            readonly $schema?: string;
            /** @description A human-readable explanation specific to this occurrence of the problem. */
            detail?: string;
            /** @description Optional list of individual error details */
            errors?: components["schemas"]["ErrorDetail"][] | null;
            /**
             * Format: uri
             * @description A URI reference that identifies the specific occurrence of the problem.
             */
            instance?: string;
            /**
             * Format: int64
             * @description HTTP status code
             */
            status?: number;
            /** @description A short, human-readable summary of the problem type. This value should not change between occurrences of the error. */
            title?: string;
            /**
             * Format: uri
             * @description A URI reference to human-readable documentation for the error.
             * @default about:blank
             */
            type: string;
        };
        Function: {
            Arguments: unknown;
            Name: string;
        };
        IngestSignalsV1RequestBody: {
            /**
             * Format: uri
             * @description A URL to the JSON Schema for this object.
             */
            readonly $schema?: string;
            Events?: components["schemas"]["CreateEventParams"][] | null;
            Findings?: components["schemas"]["CreateFindingParams"][] | null;
            Sessions?: components["schemas"]["CreateSessionParams"][] | null;
            Spans?: components["schemas"]["CreateSpanParams"][] | null;
            Traces?: components["schemas"]["CreateTraceParams"][] | null;
        };
        IngestSignalsV1ResponseBody: {
            /**
             * Format: uri
             * @description A URL to the JSON Schema for this object.
             */
            readonly $schema?: string;
        };
        Options: {
            APIKey?: string;
            APIVersion?: string;
            BaseURL?: string;
            DeploymentID?: string;
            /** Format: double */
            FrequencyPenalty?: number;
            FunctionCall?: string;
            Functions?: string[] | null;
            LogitBias?: {
                [key: string]: unknown;
            };
            Logprobs?: boolean;
            /** Format: int64 */
            MaxTokens?: number;
            Model?: string;
            ModelList?: string[] | null;
            /** Format: int64 */
            N?: number;
            /** Format: double */
            PresencePenalty?: number;
            ResponseFormat?: {
                [key: string]: unknown;
            };
            /** Format: int64 */
            Seed?: number;
            Stop?: {
                [key: string]: unknown;
            };
            Stream?: boolean;
            /** Format: double */
            Temperature?: number;
            /** Format: double */
            Timeout?: number;
            ToolChoice?: string;
            Tools?: components["schemas"]["Tool"][] | null;
            /** Format: int64 */
            TopLogprobs?: number;
            /** Format: double */
            TopP?: number;
            User?: string;
        };
        Output: {
            Messages: (components["schemas"]["SystemMessage"] | components["schemas"]["UserMessage"] | components["schemas"]["AssistantMessage"] | components["schemas"]["ToolMessage"])[] | null;
            Text: string;
        };
        Payload: {
            /** @description Input for completion */
            Input?: components["schemas"]["TextInput"] | components["schemas"]["ChatInput"];
            Output?: components["schemas"]["Output"];
        };
        SimplifiedFinding: {
            /** Format: date-time */
            At: string;
            Comment: string;
            EvaluatorID: string | null;
            Metadata: {
                [key: string]: unknown;
            };
            Name: string;
            /** @enum {string} */
            Source: "annotation" | "api" | "enduser" | "evaluator";
            Value: number | boolean | string;
        };
        SummarisedEntry: {
            /** Format: int64 */
            DurationMs: number;
            EvaluatorID: string;
            Findings: components["schemas"]["SimplifiedFinding"][] | null;
            ID: string;
            InstanceID: string | null;
            Message: string;
            Outcome: string;
            /** Format: double */
            Score: number | null;
            Skip: string;
            TenantID: string;
        };
        SystemMessage: {
            Contents: (components["schemas"]["TextPart"] | components["schemas"]["DataPart"])[] | null;
            Name?: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            Role: "system";
        };
        TextInput: {
            Text: string;
        };
        TextPart: {
            Text: string;
        };
        Tool: {
            Description: string;
            Name: string;
            Parameters: unknown;
        };
        ToolCall: {
            Function: components["schemas"]["Function"];
            ID: string;
            /** @enum {string} */
            Type: "function";
        };
        ToolMessage: {
            Contents: (components["schemas"]["TextPart"] | components["schemas"]["DataPart"])[] | null;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            Role: "tool";
            ToolCallID: string;
        };
        UserMessage: {
            Contents: (components["schemas"]["TextPart"] | components["schemas"]["DataPart"])[] | null;
            Name?: string;
            /**
             * @description discriminator enum property added by openapi-typescript
             * @enum {string}
             */
            Role: "user";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "call-guardrail": {
        parameters: {
            query?: {
                dryrun?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CallGuardrailRequestBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Call"];
                };
            };
            /** @description Error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ErrorModel"];
                };
            };
        };
    };
    "ingest-signals-v1": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IngestSignalsV1RequestBody"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["IngestSignalsV1ResponseBody"];
                };
            };
            /** @description Error */
            default: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/problem+json": components["schemas"]["ErrorModel"];
                };
            };
        };
    };
}
