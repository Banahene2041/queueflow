import { describe, expect, it } from 'vitest'
import { hashAccessToken, mintAccessToken } from './tokens'

describe('ticket tokens', () => {
  it('mints URL-safe high-entropy tokens', () => {
    const a = mintAccessToken()
    const b = mintAccessToken()
    expect(a).not.toEqual(b)
    expect(a.length).toBeGreaterThanOrEqual(40)
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('hashes deterministically without returning the raw token', async () => {
    const token = mintAccessToken()
    const hash = await hashAccessToken(token)
    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(hash).not.toEqual(token)
    expect(await hashAccessToken(token)).toEqual(hash)
  })
})
