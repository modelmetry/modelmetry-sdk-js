import { expect, test } from 'vitest'
import { ModelmetryClient } from './sdk'
import { GuardrailsClient } from './guardrails/guardrails-client'

test('Instantiate ModelmetryClient', () => {
  const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: 'md29dn239fn349u8fnu239fniuo2' })
  expect(client).toBeInstanceOf(ModelmetryClient)
  expect(client.getBaseURL()).toBe("http://localhost:8888")
  expect(client.getClient()).toBeDefined()
  expect(client.guardrails()).toBeInstanceOf(GuardrailsClient)
})

test("Instantiate with an empty API key", () => {
  expect(() => {
    const client = new ModelmetryClient({ baseUrl: 'http://localhost:8888', apikey: '' })
  }).toThrowError("API key not set. Please set the API key before making requests.")
})
