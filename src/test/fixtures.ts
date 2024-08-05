import createClient from "openapi-fetch";
import { vi } from "vitest";
import type { paths } from "../openapi";
import { asyncSleep } from "../utils/dates";

const DEFAULT_RESPONSE = new Response(JSON.stringify({ Outcome: "pass" }), {
  status: 200,
});

export const makeBasicMockFetch = (res: Response = DEFAULT_RESPONSE) => {
  return vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >(async (input, init) => {
    return res;
  });
};

export const makeMockClient = (res: Response = DEFAULT_RESPONSE, opts: {
  sleepTimeMs?: number;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
} = {}) => {

  const mockFetch = opts.fetch || vi.fn<
    (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  >(async (input, init) => {

    if (opts.sleepTimeMs && opts.sleepTimeMs > 0) {
      await asyncSleep(opts.sleepTimeMs);
    }

    return res;
  });

  const client = createClient<paths>({
    baseUrl: "https://my-site.com/api/v1/",
    fetch: mockFetch,
  });

  return client
};
