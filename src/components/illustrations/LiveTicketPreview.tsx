/**
 * Decorative animated ticket preview — CSS-driven so it can sit on the
 * static landing without JS hydration tricks.
 */
export function LiveTicketPreview({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`qf-ticket-stage relative overflow-hidden rounded-2xl border border-white/10 bg-[#12181a] text-[#f3f5f4] shadow-[0_28px_70px_rgba(18,24,26,0.35)] ${className}`}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-cyan-600/10 blur-3xl" />

      <div className="relative px-6 pb-7 pt-5 sm:px-7">
        <div className="flex items-center justify-between text-[11px] tracking-[0.16em] text-white/50 uppercase">
          <span>Northside Cuts</span>
          <span className="inline-flex items-center gap-2 normal-case tracking-normal">
            <span className="qf-live-dot size-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300/90">Live</span>
          </span>
        </div>

        <div className="qf-ticket-number-wrap relative mt-9 h-[4.5rem] overflow-hidden">
          <div className="qf-ticket-number-reel font-display text-7xl font-semibold tracking-tight tabular-nums">
            <span>12</span>
            <span>13</span>
            <span>14</span>
            <span>15</span>
            <span>12</span>
          </div>
        </div>

        <p className="qf-ticket-meta mt-3 text-sm text-white/65">
          <span className="qf-fade-cycle-a">3 ahead · about 24 min</span>
          <span className="qf-fade-cycle-b">2 ahead · about 18 min</span>
          <span className="qf-fade-cycle-c">You’re next · stay close</span>
        </p>

        <div className="mt-9 grid grid-cols-3 gap-2">
          {['Waiting', 'Called', 'Serving'].map((label, i) => (
            <div
              key={label}
              className={`qf-step-chip rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2.5 text-center text-[11px] ${
                i === 0 ? 'qf-step-a' : i === 1 ? 'qf-step-b' : 'qf-step-c'
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
