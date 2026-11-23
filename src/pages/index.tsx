/**
 * Landing — static, crawler-safe. No auth / WebSocket.
 */

import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { APP_NAME } from '../constants'
import { seo } from '../seo'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div data-testid="static-landing" className="min-h-screen qf-mesh text-foreground">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <Link to="/home" className={cn(buttonVariants({ size: 'sm' }))}>
            Staff sign in
          </Link>
        </header>

        <main>
          <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:pt-16">
            <div className="qf-fade-up max-w-xl">
              <p className="font-display text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                {APP_NAME}
              </p>
              <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Know your place
                <br />
                in line.
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
                Walk-ins join from their phone. Your floor runs one live queue —
                call, serve, done.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link to="/home" className={cn(buttonVariants({ size: 'lg' }))}>
                  Open the floor
                </Link>
                <Link
                  to="/queue/demo"
                  className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
                >
                  Guest preview
                </Link>
              </div>
            </div>

            <div
              aria-hidden
              className="qf-fade-up qf-fade-up-delay relative overflow-hidden rounded-xl border border-border bg-[#12181a] px-6 py-8 text-[#f3f5f4] shadow-[0_24px_60px_rgba(18,24,26,0.22)]"
            >
              <div className="flex items-center justify-between text-xs tracking-wide text-white/55 uppercase">
                <span>Northside Cuts</span>
                <span className="inline-flex items-center gap-2">
                  <span className="qf-live-dot size-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              </div>
              <p className="font-display mt-10 text-7xl font-semibold tracking-tight tabular-nums">
                14
              </p>
              <p className="mt-2 text-sm text-white/70">2 ahead · about 18 min</p>
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-white/10 text-sm">
                <div className="bg-white/5 px-4 py-3">
                  <p className="text-[11px] tracking-wide text-white/45 uppercase">Status</p>
                  <p className="mt-1 font-medium text-emerald-300">Waiting</p>
                </div>
                <div className="bg-white/5 px-4 py-3">
                  <p className="text-[11px] tracking-wide text-white/45 uppercase">Now serving</p>
                  <p className="mt-1 font-medium">12</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-y border-border/80 bg-white/50">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
              {[
                {
                  n: '01',
                  t: 'Share the link',
                  d: 'Guests open your public queue page — no download, no account.',
                },
                {
                  n: '02',
                  t: 'They take a ticket',
                  d: 'Name in, private ticket out. Position and wait update live.',
                },
                {
                  n: '03',
                  t: 'You run the floor',
                  d: 'Call next, mark serving, complete. Every station stays synced.',
                },
              ].map((step) => (
                <div key={step.n}>
                  <p className="font-display text-sm font-semibold text-primary">{step.n}</p>
                  <h2 className="font-display mt-3 text-xl font-semibold tracking-tight">
                    {step.t}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col justify-between gap-6 border-t border-border pt-10 md:flex-row md:items-end">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight">
                  Built for Saturday rush
                </h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  One screen for who’s waiting and who’s in the chair. Designed for
                  the busy hour, not the demo.
                </p>
              </div>
              <Link to="/home" className={cn(buttonVariants({ size: 'lg' }))}>
                Start free on DeepSpace
              </Link>
            </div>
          </section>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
            <span className="font-display font-medium text-foreground">{APP_NAME}</span>
            <span>Real-time queues</span>
          </div>
        </footer>
      </div>
    </>
  )
}
