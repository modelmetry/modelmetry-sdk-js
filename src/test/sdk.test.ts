import { expect, test, vi } from 'vitest'
import { GuardrailsClient } from '../guardrails/guardrails-client'
import { ModelmetryClient } from '../sdk'
import { makeBasicMockFetch } from './fixtures'

test('Instantiate ModelmetryClient', () => {
  const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: 'md29dn239fn349u8fnu239fniuo2', tenantId: 'ten_1234' })
  expect(client).toBeInstanceOf(ModelmetryClient)
  expect(client.getBaseURL()).toBe("http://localhost:8888")
  expect(client.getClient()).toBeDefined()
  expect(client.guardrails()).toBeInstanceOf(GuardrailsClient)
})

test("Instantiate with an empty API key", () => {
  expect(() => {
    const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: '', tenantId: 'ten_1234' })
  }).toThrowError("API key not set. Please set the API key when initialising ModelmetryClient.")
})

test("Instantiate with an invalid tenant ID", () => {
  expect(() => {
    const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: 'md29dn239fn349u8fnu239fniuo2', tenantId: '' })
  }).toThrowError("Tenant id not set or invalid. Please set a valid tenant id when initialising ModelmetryClient.")
})

test("should set the x-api-key header with the provided api key for outgoing Request objects", async () => {

  const mockFetch = makeBasicMockFetch();
  const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: 'md29dn239fn349u8fnu239fniuo2', tenantId: 'ten_1234', fetch: mockFetch })
  const guardrails = client.guardrails()
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
  expect(req.headers.get("x-api-key")).toBe("md29dn239fn349u8fnu239fniuo2");
  expect(await req.json()).toEqual(body);
})
