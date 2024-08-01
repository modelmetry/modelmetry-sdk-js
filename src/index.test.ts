import { assert, expect, test } from 'vitest'
import { newClient } from './'

test('newClient', () => {
  expect(newClient()).toEqual({ client: true })
})
