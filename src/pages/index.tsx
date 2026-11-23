/**
 * Landing — static, crawler-safe. No auth / WebSocket.
 * Motion is CSS-only so prerender stays intact.
 */

import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { APP_NAME } from '../constants'
import { seo } from '../seo'
import { LiveTicketPreview } from '@/components/illustrations/LiveTicketPreview'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function Landing() {
  return (
    <>
      <Seo {...seo} path="/" />
      <div data-testid="static-landing" className="min-h-screen bg-[#0d1416] text-[#f3f5f4]">
        <header className="absolute inset-x-0 top-0 z-20">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
            <Link to="/" className="font-display text-xl font-semibold tracking-tight text-white">
              {APP_NAME}
            </Link>
            <Link
              to="/home"
              className={cn(
                buttonVariants({ size: 'sm' }),
                'border-white/20 bg-white/10 text-white hover:bg-white/20',
              )}
            >
              Staff sign in
            </Link>
          </div>
        </header>

        <main>
          {/* Full-bleed hero — brand + one line + CTA + dominant image */}
          <section className="relative min-h-[100svh] overflow-hidden">
            <img
              src="/illustrations/landing-hero.jpg"
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1416]/92 via-[#0d1416]/72 to-[#0d1416]/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1416] via-transparent to-[#0d1416]/40" />

            <div className="relative z-10 mx-auto grid min-h-[100svh] max-w-6xl items-end gap-10 px-6 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-24">
              <div className="qf-fade-up max-w-xl">
                <p className="font-display text-sm font-semibold tracking-[0.22em] text-teal-300 uppercase">
                  {APP_NAME}
                </p>
                <h1 className="font-display mt-5 text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Know your place
                  <br />
                  in line.
                </h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
                  Walk-ins join from their phone. Your floor runs one live queue —
                  call, serve, done.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    to="/home"
                    className={cn(
                      buttonVariants({ size: 'lg' }),
                      'bg-teal-600 text-white hover:bg-teal-500',
                    )}
                  >
                    Open the floor
                  </Link>
                  <Link
                    to="/queue/demo"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'lg' }),
                      'border-white/25 bg-transparent text-white hover:bg-white/10',
                    )}
                  >
                    Guest preview
                  </Link>
                </div>
              </div>

              <div className="qf-fade-up qf-fade-up-delay qf-float hidden lg:block">
                <LiveTicketPreview />
              </div>
            </div>

            <div className="qf-scroll-hint pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
              <div className="h-8 w-px bg-gradient-to-b from-white/50 to-transparent" />
            </div>
          </section>

          <section className="border-y border-white/10 bg-[#12181a]">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-3">
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
              ].map((step, i) => (
                <div
                  key={step.n}
                  className={cn(
                    'qf-fade-up',
                    i === 1 && 'qf-fade-up-delay',
                    i === 2 && 'qf-fade-up-delay-2',
                  )}
                >
                  <p className="font-display text-sm font-semibold text-teal-400">{step.n}</p>
                  <h2 className="font-display mt-3 text-xl font-semibold tracking-tight text-white">
                    {step.t}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0d1416]">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="qf-fade-up flex flex-col justify-between gap-8 border-t border-white/10 pt-12 md:flex-row md:items-end">
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Built for Saturday rush
                  </h2>
                  <p className="mt-3 max-w-md text-white/55">
                    One screen for who’s waiting and who’s in the chair. Designed for
                    the busy hour, not the demo.
                  </p>
                </div>
                <Link
                  to="/home"
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'bg-teal-600 text-white hover:bg-teal-500',
                  )}
                >
                  Start free on DeepSpace
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-white/10 bg-[#0d1416]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-white/45">
            <span className="font-display font-medium text-white/80">{APP_NAME}</span>
            <span>Real-time queues</span>
          </div>
        </footer>
      </div>
    </>
  )
}
