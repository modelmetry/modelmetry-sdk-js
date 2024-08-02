import type { APIError } from "../openapi";

export const isAPIError = (obj: unknown): obj is APIError => {
  // must be an object
  if (typeof obj !== "object" || obj === null) return false;
  // must have a "type" string property
  if (typeof (obj as APIError).type !== "string") return false;
  // all good
  return true;
};
