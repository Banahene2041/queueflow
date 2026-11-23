import { describe, expect, it } from 'vitest'
import {
  canTransition,
  counterRecordId,
  estimateWaitMinutes,
  isTerminalStatus,
  isValidSlug,
  normalizeSlug,
  snapshotRecordId,
  ticketRoomId,
} from './queue'

describe('queue helpers', () => {
  it('allows only documented ticket transitions', () => {
    expect(canTransition('waiting', 'serving')).toBe(true)
    expect(canTransition('waiting', 'skipped')).toBe(true)
    expect(canTransition('waiting', 'cancelled')).toBe(true)
    expect(canTransition('serving', 'completed')).toBe(true)
    expect(canTransition('waiting', 'completed')).toBe(false)
    expect(canTransition('completed', 'serving')).toBe(false)
    expect(canTransition('skipped', 'waiting')).toBe(false)
  })

  it('classifies terminal statuses', () => {
    expect(isTerminalStatus('completed')).toBe(true)
    expect(isTerminalStatus('waiting')).toBe(false)
  })

  it('normalizes and validates slugs', () => {
    expect(normalizeSlug(' Blue Salon! ')).toBe('blue-salon')
    expect(isValidSlug('blue-salon')).toBe(true)
    expect(isValidSlug('a')).toBe(false)
    expect(isValidSlug('-bad-')).toBe(false)
  })

  it('builds stable record and room ids', () => {
    expect(snapshotRecordId('biz_1')).toBe('snapshot:biz_1')
    expect(counterRecordId('biz_1', '2026-11-23')).toBe('counter:biz_1:2026-11-23')
    expect(ticketRoomId('tok_abc')).toBe('ticket:tok_abc')
  })

  it('estimates wait from people ahead', () => {
    expect(estimateWaitMinutes(3, 20)).toBe(60)
    expect(estimateWaitMinutes(0, 20)).toBe(0)
  })
})
