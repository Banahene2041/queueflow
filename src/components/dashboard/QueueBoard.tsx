import { useMemo, useState } from 'react'
import { useQuery, toConnectionStatus } from 'deepspace'
import { ConfirmModal, Button, useToast } from '@/components/ui'
import { ConnectionBanner } from '@/components/queue/ConnectionBanner'
import { StaffPresence } from '@/components/presence/StaffPresence'
import { callAction } from '@/lib/actions'
import type { Ticket, TicketStatus } from '@/types/queue'
import { cn } from '@/lib/utils'

type TicketRow = { recordId: string; data: Ticket }

export function QueueBoard({
  businessId,
  businessSlug,
  membershipRole,
}: {
  businessId: string
  businessSlug: string
  membershipRole?: string
}) {
  const { success, error } = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<{
    title: string
    description: string
    action: string
    ticketId: string
  } | null>(null)

  const { records, status } = useQuery<Ticket>('tickets', {
    where: { businessId },
    orderBy: 'joinedAt',
    orderDir: 'asc',
    limit: 200,
  })

  const tickets = records as TicketRow[]
  const waiting = useMemo(
    () => tickets.filter((t) => t.data.status === 'waiting'),
    [tickets],
  )
  const serving = useMemo(
    () => tickets.find((t) => t.data.status === 'serving') ?? null,
    [tickets],
  )

  async function run(name: string, params: Record<string, unknown>, ok: string) {
    setBusy(name)
    const result = await callAction(name, { businessId, ...params })
    setBusy(null)
    if (!result.success) {
      error('Couldn’t update queue', result.error)
      return false
    }
    success(ok)
    return true
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StaffPresence businessId={businessId} role={membershipRole} />
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/queue/${businessSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            /queue/{businessSlug}
          </a>
          <Button
            onClick={() => void run('callNextTicket', {}, 'Next guest called')}
            loading={busy === 'callNextTicket'}
            disabled={Boolean(serving) || waiting.length === 0}
          >
            Call next
          </Button>
        </div>
      </div>

      <ConnectionBanner status={toConnectionStatus(status)} />

      {/* Left → right floor flow */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="min-h-[320px] rounded-lg border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-display text-sm font-semibold tracking-wide uppercase">
              Waiting
            </h2>
            <span className="tabular-nums text-sm text-muted-foreground">{waiting.length}</span>
          </header>

          {status === 'loading' ? (
            <div className="space-y-2 p-4">
              <div className="h-16 animate-pulse rounded-md bg-muted" />
              <div className="h-16 animate-pulse rounded-md bg-muted" />
            </div>
          ) : waiting.length === 0 ? (
            <p className="px-4 py-16 text-center text-sm text-muted-foreground">
              No one waiting. Share the public link when walk-ins arrive.
            </p>
          ) : (
            <ul>
              {waiting.map((ticket, index) => (
                <li
                  key={ticket.recordId}
                  className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <div className="w-12 shrink-0">
                    <p className="font-display text-2xl font-semibold tabular-nums leading-none">
                      {ticket.data.ticketNumber}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {index === 0 ? 'Next' : `+${index}`}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{ticket.data.customerName}</p>
                    {ticket.data.phone ? (
                      <p className="truncate text-xs text-muted-foreground">{ticket.data.phone}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <Button
                      size="sm"
                      disabled={Boolean(serving)}
                      loading={busy === `serve:${ticket.recordId}`}
                      onClick={() =>
                        void run(
                          'markServing',
                          { ticketId: ticket.recordId },
                          `Serving #${ticket.data.ticketNumber}`,
                        )
                      }
                    >
                      Serve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setConfirm({
                          title: `Skip #${ticket.data.ticketNumber}?`,
                          description: `${ticket.data.customerName} leaves the waiting line.`,
                          action: 'skipTicket',
                          ticketId: ticket.recordId,
                        })
                      }
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() =>
                        setConfirm({
                          title: `Cancel #${ticket.data.ticketNumber}?`,
                          description: `${ticket.data.customerName}'s ticket will be cancelled.`,
                          action: 'cancelTicket',
                          ticketId: ticket.recordId,
                        })
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className={cn(
            'flex min-h-[320px] flex-col rounded-lg border border-border',
            serving ? 'bg-[#12181a] text-[#f3f5f4]' : 'bg-card',
          )}
        >
          <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2
              className={cn(
                'font-display text-sm font-semibold tracking-wide uppercase',
                serving ? 'text-white/70' : 'text-foreground',
              )}
            >
              In service
            </h2>
            {serving && <StatusChip status="serving" dark />}
          </header>

          {serving ? (
            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <p className="font-display text-6xl font-semibold tabular-nums tracking-tight">
                  {serving.data.ticketNumber}
                </p>
                <p className="mt-3 text-lg font-medium">{serving.data.customerName}</p>
                {serving.data.phone && (
                  <p className="mt-1 text-sm text-white/55">{serving.data.phone}</p>
                )}
              </div>
              <Button
                size="lg"
                className="mt-8 w-full bg-white text-[#12181a] hover:bg-white/90"
                loading={busy === 'completeTicket'}
                onClick={() =>
                  void run(
                    'completeTicket',
                    { ticketId: serving.recordId },
                    `Completed #${serving.data.ticketNumber}`,
                  )
                }
              >
                Complete
              </Button>
            </div>
          ) : (
            <p className="flex flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
              Chair is free. Call the next guest.
            </p>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={confirm?.title ?? ''}
        description={confirm?.description}
        confirmText={confirm?.action === 'cancelTicket' ? 'Cancel ticket' : 'Skip'}
        variant="destructive"
        loading={busy === confirm?.action}
        onConfirm={() => {
          if (!confirm) return
          void run(
            confirm.action,
            { ticketId: confirm.ticketId },
            confirm.action === 'cancelTicket' ? 'Ticket cancelled' : 'Ticket skipped',
          ).then((ok) => {
            if (ok) setConfirm(null)
          })
        }}
      />
    </div>
  )
}

function StatusChip({ status, dark }: { status: TicketStatus; dark?: boolean }) {
  if (status !== 'serving') return null
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        dark ? 'bg-emerald-400/15 text-emerald-300' : 'bg-success/10 text-success',
      )}
    >
      <span className="qf-live-dot size-1.5 rounded-full bg-current" />
      Serving
    </span>
  )
}
