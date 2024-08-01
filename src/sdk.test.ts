import { expect, test } from 'vitest'
import { ModelmetryClient } from './sdk'
import { GuardrailsClient } from './guardrails/guardrails-client'

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