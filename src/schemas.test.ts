import { describe, expect, it } from 'vitest'
import { lintSchemas } from 'deepspace/worker'
import { schemas } from './schemas'

describe('QueueFlow schemas', () => {
  it('registers the expected collections', () => {
    const names = schemas.map((s) => s.name).sort()
    expect(names).toEqual(
      [
        'businesses',
        'queue_counters',
        'queue_events',
        'queue_snapshots',
        'settings',
        'team_members',
        'ticket_secrets',
        'ticket_views',
        'tickets',
        'users',
      ].sort(),
    )
  })

  it('passes DeepSpace schema lint', () => {
    expect(lintSchemas(schemas)).toEqual([])
  })
})
