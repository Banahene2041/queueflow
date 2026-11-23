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
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <img
        src="/illustrations/home-queue.jpg"
        alt=""
        className="aspect-[16/10] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#12181a]/88 via-[#12181a]/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="mb-3 flex items-center justify-between text-[11px] tracking-wide text-white/55 uppercase">
          <span>Live floor</span>
          <span className="inline-flex items-center gap-1.5 normal-case tracking-normal text-emerald-300/90">
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
                  'rounded-md border px-2.5 py-2 transition-colors duration-300',
                  highlight
                    ? 'border-white/25 bg-white/15'
                    : 'border-white/10 bg-white/5',
                )}
              >
                <p className="font-display text-lg font-semibold tabular-nums text-white">
                  {ticket.n}
                </p>
                <p className="truncate text-[11px] text-white/65">{ticket.name}</p>
                <p className="mt-0.5 text-[10px] tracking-wide text-white/45 uppercase">
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
