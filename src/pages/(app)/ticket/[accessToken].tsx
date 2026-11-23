/**
 * Private customer ticket — capability URL + live RecordScope room.
 */

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  RecordScope,
  useQuery,
  toConnectionStatus,
} from 'deepspace'
import { APP_NAME } from '../../../constants'
import { ConnectionBanner } from '../../../components/queue/ConnectionBanner'
import { callPublicQueue } from '../../../lib/actions'
import { ticketRoomId } from '../../../lib/queue'
import { ticketViewsSchema } from '../../../schemas/ticket-views-schema'
import type { TicketStatus, TicketView } from '../../../types/queue'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

type SafeTicket = {
  businessId: string
  businessName: string
  ticketNumber: number
  status: TicketStatus
  peopleAhead: number
  estimatedWaitMinutes: number
  customerName: string
  isOpen: boolean
}

export default function CustomerTicketPage() {
  const { accessToken } = useParams<{ accessToken: string }>()
  const token = accessToken?.trim() ?? ''
  const valid = token.length >= 16

  if (!valid) {
    return (
      <Shell>
        <p className="text-center text-sm text-muted-foreground">This ticket link is invalid.</p>
      </Shell>
    )
  }

  return (
    <RecordScope roomId={ticketRoomId(token)} schemas={[ticketViewsSchema]}>
      <TicketLive token={token} />
    </RecordScope>
  )
}

function TicketLive({ token }: { token: string }) {
  const [bootstrap, setBootstrap] = useState<SafeTicket | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { records, status } = useQuery<TicketView>('ticket_views', { limit: 1 })
  const live = records[0]?.data

  useEffect(() => {
    let cancelled = false
    async function load() {
      const result = await callPublicQueue<SafeTicket>(
        `/api/queue/tickets/${encodeURIComponent(token)}`,
      )
      if (cancelled) return
      if (!result.success) {
        setLoadError(result.error)
        setLoading(false)
        return
      }
      setBootstrap(result.data)
      setLoadError(null)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  const view = live ?? bootstrap
  const connection = toConnectionStatus(status)

  return (
    <Shell>
      <ConnectionBanner status={connection} />

      {loading && !view ? (
        <div className="space-y-3 pt-8">
          <div className="mx-auto h-10 w-24 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-20 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      ) : loadError && !view ? (
        <p className="pt-8 text-center text-sm text-destructive">{loadError}</p>
      ) : view ? (
        <div className="pt-4 text-center">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {view.businessName}
          </p>
          <p className="font-display mt-8 text-7xl font-semibold tracking-tight tabular-nums">
            {view.ticketNumber}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">Hi, {view.customerName}</p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            <Meta
              label="Ahead of you"
              value={
                view.status === 'waiting'
                  ? view.peopleAhead === 0
                    ? 'You’re next'
                    : String(view.peopleAhead)
                  : '—'
              }
            />
            <Meta
              label="Est. wait"
              value={
                view.status === 'waiting' && view.peopleAhead > 0
                  ? `~${view.estimatedWaitMinutes} min`
                  : '—'
              }
            />
          </div>

          <StatusBlock status={view.status} />
        </div>
      ) : null}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-testid="customer-ticket-page"
      className="mx-auto flex min-h-full max-w-md flex-col px-4 py-8 text-foreground"
    >
      <p className="font-display text-center text-sm font-semibold tracking-tight text-primary">
        {APP_NAME}
      </p>
      <div className="mt-6 flex-1">{children}</div>
      <Link
        to="/"
        className={cn(buttonVariants({ variant: 'ghost' }), 'mt-8 self-center text-muted-foreground')}
      >
        {APP_NAME} home
      </Link>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-3 py-3">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  )
}

function StatusBlock({ status }: { status: TicketStatus }) {
  const copy: Record<TicketStatus, { title: string; tone: string }> = {
    waiting: { title: 'Waiting', tone: 'bg-secondary text-foreground' },
    serving: { title: 'You’re up — head in', tone: 'bg-primary text-primary-foreground' },
    completed: { title: 'Service complete', tone: 'bg-success/15 text-success' },
    skipped: { title: 'Skipped', tone: 'bg-muted text-muted-foreground' },
    cancelled: { title: 'Cancelled', tone: 'bg-destructive/10 text-destructive' },
  }
  const c = copy[status]
  return (
    <p className={cn('mt-8 rounded-md px-4 py-3 text-sm font-semibold', c.tone)}>{c.title}</p>
  )
}
