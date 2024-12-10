import createClient from "openapi-fetch";
import { describe, expect, test } from "vitest";
import { GuardrailsClient } from "../guardrails";
import type { paths } from "../openapi";
import { makeBasicMockFetch } from "./fixtures";

test("GuardrailsClient.check() arguements are properly passed to the request", async () => {

  const mockFetch = makeBasicMockFetch();

  const transport = createClient<paths>({
    baseUrl: "http://localhost:8888/",
    fetch: mockFetch,
  });

  const guardrails = new GuardrailsClient({
    tenantId: "ten_1234",
    client: transport,
  })

  const body = {
    GuardrailID: "grd_1234",
    TenantID: "ten_1234",
    Payload: {
      Completion: {
        Messages: [{ Role: "user", Contents: [{ Text: "Something" }] }],
        Options: {},
      }
    },
  }

  await guardrails.checkText("Something", body.GuardrailID);

  // @ts-ignore 
  const req = mockFetch.mock.calls[0][0] as Request;
  expect(req).toBeInstanceOf(Request);
  expect(req.url).toBe("http://localhost:8888/checks");
  expect(await req.json()).toEqual(body);
});

describe("GuardrailsClient.check() returns a GuardrailCheckResult object", async () => {

  const body = {
    GuardrailID: "grd_1234",
    TenantID: "ten_1234",
    Payload: {
      Completion: {
        Messages: [{ Role: "user", Contents: [{ Text: "Something" }] }],
        Options: {},
      }
    },
  }

  test("when the request is successful", async () => {
    const mockFetch = makeBasicMockFetch(new Response(JSON.stringify({ Outcome: "pass" }), { status: 200 }));
    const transport = createClient<paths>({
      baseUrl: "http://localhost:8888/",
      fetch: mockFetch,
    });

    const guardrails = new GuardrailsClient({
      tenantId: "ten_1234",
      client: transport,
    })

    const result = await guardrails.checkText("Something", body.GuardrailID);

    expect(result.passed).toBeTruthy();
  })

  test("when the request errors", async () => {
    const mockFetch = makeBasicMockFetch(new Response(JSON.stringify({}), { status: 500 }));
    const transport = createClient<paths>({
      baseUrl: "http://localhost:8888/",
      fetch: mockFetch,
    });

    const guardrails = new GuardrailsClient({
      tenantId: "ten_1234",
      client: transport,
    })

    const result = await guardrails.checkText("Something", body.GuardrailID);

    expect(result.errored).toBeTruthy();
  })

  test("when the request fails", async () => {
    const mockFetch = makeBasicMockFetch(new Response(JSON.stringify({ Outcome: "fail" }), { status: 200 }));
    const transport = createClient<paths>({
      baseUrl: "http://localhost:8888/",
      fetch: mockFetch,
    });

    const guardrails = new GuardrailsClient({
      tenantId: "ten_1234",
      client: transport,
    })

    const result = await guardrails.checkText("Something", body.GuardrailID);

    expect(result.failed).toBeTruthy();
    expect(result.errored).toBeFalsy();
  })

});