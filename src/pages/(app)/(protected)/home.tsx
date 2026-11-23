/* home pattern: data-forward — jump straight into today's floor console */
import { Link } from 'react-router-dom'
import { useAuthProfileReady } from 'deepspace'
import { HomeFloorPreview } from '@/components/illustrations/HomeFloorPreview'
import { APP_NAME } from '../../../constants'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { user } = useAuthProfileReady({ requireUser: true })
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="relative mx-auto min-h-full max-w-5xl overflow-hidden px-6 py-12 sm:py-16">
      <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-10 size-64 rounded-full bg-cyan-600/10 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="qf-fade-up">
          <p className="font-display text-sm font-semibold tracking-[0.18em] text-primary uppercase">
            {APP_NAME}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {firstName ? `Hi, ${firstName}` : 'Floor console'}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Open today’s queue, call the next guest, and keep every chair in sync —
            live across every station.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/dashboard" className={cn(buttonVariants({ size: 'lg' }))}>
              Go to today
            </Link>
            <Link
              to="/dashboard/queue"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Open queue
            </Link>
          </div>

          <ul className="mt-10 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {[
              { label: 'Live tickets', hint: 'Syncs in seconds' },
              { label: 'Staff presence', hint: 'Who’s on the floor' },
              { label: 'Guest link', hint: 'Phone-first join' },
            ].map((item, i) => (
              <li
                key={item.label}
                className={cn(
                  'qf-fade-up rounded-lg border border-border/80 bg-card/60 px-3 py-3',
                  i === 1 && 'qf-fade-up-delay',
                  i === 2 && 'qf-fade-up-delay-2',
                )}
              >
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs">{item.hint}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="qf-fade-up qf-fade-up-delay qf-float">
          <HomeFloorPreview />
        </div>
      </div>
    </div>
  )
}
