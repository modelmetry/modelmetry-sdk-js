import { vi } from "vitest";

const DEFAULT_RESPONSE = new Response(JSON.stringify({ Outcome: "pass" }), { status: 200 })

export const makeBasicMockFetch = (res: Response = DEFAULT_RESPONSE) => {
  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async (input, init) => {
      return res;
    }
  );
}