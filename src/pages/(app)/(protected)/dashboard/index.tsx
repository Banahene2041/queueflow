import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'deepspace'
import { BusinessSettingsModal } from '@/components/forms/BusinessSettingsModal'
import { EmptyShopState } from '@/components/illustrations/EmptyShopState'
import { buttonVariants } from '@/components/ui'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { cn } from '@/lib/utils'
import { queueDayKey, snapshotRecordId } from '@/lib/queue'
import type { QueueSnapshot, Ticket } from '@/types/queue'

export default function DashboardOverviewPage() {
  const { business, loading, error, refresh } = useMyBusiness()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const today = queueDayKey()

  const { records: snapshots } = useQuery<QueueSnapshot>('queue_snapshots', {
    where: { businessId: business?.id ?? '__none__' },
    limit: 1,
  })
  const { records: tickets } = useQuery<Ticket>('tickets', {
    where: { businessId: business?.id ?? '__none__' },
    limit: 200,
  })

  const snapshot =
    business && snapshots.find((r) => r.recordId === snapshotRecordId(business.id))?.data

  const completedToday = useMemo(
    () =>
      tickets.filter((t) => t.data.status === 'completed' && t.data.queueDay === today).length,
    [tickets, today],
  )

  const waiting =
    snapshot?.waitingCount ?? tickets.filter((t) => t.data.status === 'waiting').length
  const servingNumber =
    snapshot?.servingTicketNumber ??
    tickets.find((t) => t.data.status === 'serving')?.data.ticketNumber ??
    0

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Today</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {business ? business.name : 'Your floor at a glance'}
        </p>
      </header>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !business ? (
        <EmptyShopState
          title="Create your shop"
          description="One profile unlocks the public queue link and staff console. Guests join from their phone — you run the floor."
          actionLabel="Get started"
          onAction={() => setSettingsOpen(true)}
        />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <Stat label="Waiting" value={String(waiting)} />
            <Stat label="In service" value={servingNumber > 0 ? `#${servingNumber}` : '—'} />
            <Stat label="Completed today" value={String(completedToday)} />
          </section>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className={business.isOpen ? 'text-success' : 'text-destructive'}>
              {business.isOpen ? 'Accepting walk-ins' : 'Closed to new joins'}
            </span>
            <span className="text-muted-foreground">
              ~{business.averageServiceMinutes} min average cut
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/queue" className={cn(buttonVariants({ size: 'lg' }))}>
              Open queue
            </Link>
            <Link
              to={`/queue/${business.slug}`}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Guest page
            </Link>
          </div>
        </>
      )}

      <BusinessSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => void refresh()}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
