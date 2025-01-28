import type { ErrorModel } from "../openapi";

// 
export class APIError extends Error {
    constructor(public errorModel: ErrorModel) {
        super(errorModel.type);
    }

}

export const isErrorModel = (obj: unknown): obj is ErrorModel => {
    // must be an object
    if (typeof obj !== "object" || obj === null) return false;
    // must have a "type" string property
    if (typeof (obj as ErrorModel).type !== "string") return false;
    // all good
    return true;
};
