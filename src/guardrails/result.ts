import type { GuardrailCheck } from "../openapi";

export type GuardrailCheckResult = {
    passed: boolean;
    errored: boolean;
    failed: boolean;
    error?: unknown;
    data?: GuardrailCheck;
};

export const newResultFromCheck = (check: GuardrailCheck): GuardrailCheckResult => {
    const { Outcome } = check;
    const result: GuardrailCheckResult = {
        passed: Outcome === "pass",
        failed: Outcome === "fail",
        errored: Outcome === "error",
        data: check,
    };
    return result;
};

export const newResultFromError = (error: unknown): GuardrailCheckResult => {
    return {
        passed: false,
        failed: false,
        errored: true,
        error,
    };
};
