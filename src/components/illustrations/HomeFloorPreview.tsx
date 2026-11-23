import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const tickets = [
  { n: 18, name: 'Maya', state: 'waiting' as const },
  { n: 19, name: 'Jordan', state: 'waiting' as const },
  { n: 17, name: 'Sam', state: 'serving' as const },
]

export function HomeFloorPreview() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((v) => (v + 1) % 3)
    }, 2200)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_rgba(18,24,26,0.08)]">
      <img
        src="/illustrations/home-queue.jpg"
        alt=""
        className="aspect-[16/9] w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#12181a]/90 via-[#12181a]/35 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between text-[11px] tracking-wide text-white/60 uppercase">
          <span>Live floor</span>
          <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-emerald-300">
            <span className="qf-live-dot size-1.5 rounded-full bg-emerald-400" />
            Synced
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {tickets.map((ticket, i) => {
            const highlight = i === active
            return (
              <div
                key={ticket.n}
                className={cn(
                  'rounded-lg border px-2.5 py-2.5 transition-all duration-500',
                  highlight
                    ? 'scale-[1.03] border-teal-300/50 bg-teal-400/15'
                    : 'border-white/10 bg-white/5',
                  ticket.state === 'serving' && highlight && 'border-emerald-300/60 bg-emerald-400/20',
                )}
              >
                <p className="font-display text-xl font-semibold tabular-nums text-white">
                  {ticket.n}
                </p>
                <p className="truncate text-[11px] text-white/65">{ticket.name}</p>
                <p className="mt-1 text-[10px] font-medium tracking-wide text-white/45 uppercase">
                  {ticket.state}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
