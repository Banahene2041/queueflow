import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, toConnectionStatus, useR2Files } from 'deepspace'
import { APP_NAME } from '../../../constants'
import { JoinQueueModal } from '@/components/forms/JoinQueueModal'
import { ConnectionBanner } from '../../../components/queue/ConnectionBanner'
import { callPublicQueue } from '../../../lib/actions'
import { snapshotRecordId } from '../../../lib/queue'
import type { QueueSnapshot } from '../../../types/queue'
import { Button, buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

type PublicBusiness = {
  id: string
  name: string
  slug: string
  description: string
  address: string
  logoKey: string
  isOpen: boolean
  averageServiceMinutes: number
}

type PublicPayload = {
  business: PublicBusiness
  snapshot: {
    waitingCount: number
    servingTicketNumber: number
    estimatedWaitMinutes: number
    isOpen: boolean
  }
}

export default function PublicQueuePage() {
  const { businessSlug } = useParams<{ businessSlug: string }>()
  const slug = businessSlug?.trim() ?? ''
  const [payload, setPayload] = useState<PublicPayload | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joinOpen, setJoinOpen] = useState(false)
  const { getUrl } = useR2Files({ scope: 'app' })

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!slug) {
        setLoadError('Missing business')
        setLoading(false)
        return
      }
      const result = await callPublicQueue<PublicPayload>(
        `/api/queue/businesses/${encodeURIComponent(slug)}`,
      )
      if (cancelled) return
      if (!result.success) {
        setPayload(null)
        setLoadError(result.error)
        setLoading(false)
        return
      }
      setPayload(result.data)
      setLoadError(null)
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [slug])

  const businessId = payload?.business.id
  const { records: snapshots, status } = useQuery<QueueSnapshot>('queue_snapshots', {
    where: { businessId: businessId ?? '__none__' },
    limit: 1,
  })

  const live = businessId
    ? snapshots.find((r) => r.recordId === snapshotRecordId(businessId))?.data
    : undefined

  const waitingCount = live?.waitingCount ?? payload?.snapshot.waitingCount ?? 0
  const estimatedWait =
    live?.estimatedWaitMinutes ?? payload?.snapshot.estimatedWaitMinutes ?? 0
  const servingNumber =
    live?.servingTicketNumber ?? payload?.snapshot.servingTicketNumber ?? 0
  const isOpen = payload
    ? payload.business.isOpen && (live?.isOpen ?? payload.snapshot.isOpen)
    : false

  return (
    <div
      data-testid="public-queue-page"
      className="mx-auto flex min-h-full max-w-md flex-col px-4 py-8 text-foreground"
    >
      <p className="font-display text-center text-sm font-semibold tracking-tight text-primary">
        {APP_NAME}
      </p>

      <div className="mt-6 space-y-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
          </div>
        ) : loadError ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold">Queue unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          </div>
        ) : payload ? (
          <>
            <header className="text-center">
              {payload.business.logoKey ? (
                <img
                  src={getUrl(payload.business.logoKey)}
                  alt=""
                  className="mx-auto mb-4 size-16 rounded-md border border-border object-cover"
                />
              ) : null}
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {payload.business.name}
              </h1>
              {payload.business.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{payload.business.description}</p>
              ) : null}
              {payload.business.address ? (
                <p className="mt-1 text-sm text-muted-foreground">{payload.business.address}</p>
              ) : null}
            </header>

            <ConnectionBanner status={toConnectionStatus(status)} />

            <div className="grid grid-cols-3 gap-2 border-y border-border py-4 text-center">
              <Metric label="Waiting" value={String(waitingCount)} />
              <Metric
                label="Serving"
                value={servingNumber > 0 ? String(servingNumber) : '—'}
              />
              <Metric
                label="Est. wait"
                value={waitingCount > 0 ? `~${estimatedWait}m` : '—'}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">Join the line</h2>
                <span
                  className={cn(
                    'text-xs font-semibold',
                    isOpen ? 'text-success' : 'text-destructive',
                  )}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              {isOpen ? (
                <Button className="w-full" size="lg" onClick={() => setJoinOpen(true)}>
                  Take a ticket
                </Button>
              ) : (
                <div className="rounded-md border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
                  This shop isn’t taking walk-ins right now.
                </div>
              )}
            </div>

            <JoinQueueModal open={joinOpen} onClose={() => setJoinOpen(false)} slug={slug} />
          </>
        ) : null}
      </div>

      <Link
        to="/"
        className={cn(buttonVariants({ variant: 'ghost' }), 'mt-10 self-center text-muted-foreground')}
      >
        About {APP_NAME}
      </Link>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-display mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}
