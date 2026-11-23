import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'deepspace'
import { buttonVariants } from '@/components/ui'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { cn } from '@/lib/utils'
import type { QueueEvent, Ticket } from '@/types/queue'

export default function DashboardActivityPage() {
  const navigate = useNavigate()
  const { business, loading: bizLoading } = useMyBusiness()

  const { records: events, status } = useQuery<QueueEvent>('queue_events', {
    where: { businessId: business?.id ?? '__none__' },
    orderBy: 'createdAt',
    orderDir: 'desc',
    limit: 80,
  })

  const { records: tickets } = useQuery<Ticket>('tickets', {
    where: { businessId: business?.id ?? '__none__' },
    limit: 200,
  })

  const ticketMap = useMemo(() => {
    const map = new Map<string, Ticket>()
    for (const t of tickets) map.set(t.recordId, t.data)
    return map
  }, [tickets])

  if (bizLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />
  }

  if (!business) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">No activity yet</p>
        <button
          type="button"
          className={cn(buttonVariants(), 'mt-5')}
          onClick={() => navigate('/dashboard/settings')}
        >
          Create business
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Activity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent queue events for {business.name}.
        </p>
      </header>

      {status === 'loading' ? (
        <div className="space-y-2">
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
        </div>
      ) : events.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Events show up as guests join and staff move the line.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {events.map((event) => {
            const ticket = ticketMap.get(event.data.ticketId)
            const when = event.createdAt
              ? new Date(event.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : ''
            return (
              <li key={event.recordId} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium capitalize">{event.data.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket
                      ? `#${ticket.ticketNumber} · ${ticket.customerName}`
                      : `Ticket ${event.data.ticketId.slice(0, 8)}…`}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">{when}</time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
