/* home pattern: data-forward — jump straight into today's floor console */
import { Link } from 'react-router-dom'
import { useAuthProfileReady } from 'deepspace'
import { ArrowRight, ListOrdered, Settings2 } from 'lucide-react'
import { HomeFloorPreview } from '@/components/illustrations/HomeFloorPreview'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { APP_NAME } from '../../../constants'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { user } = useAuthProfileReady({ requireUser: true })
  const { business, loading } = useMyBusiness()
  const firstName = user?.name?.split(' ')[0]

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {APP_NAME}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {firstName ? `Hi, ${firstName}` : 'Floor console'}
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {business
              ? `You’re signed in for ${business.name}. Open today to run the live queue.`
              : 'Open the floor console to create your shop and start taking walk-ins.'}
          </p>

          {!loading && business ? (
            <p className="mt-4 text-sm">
              <span
                className={cn(
                  'font-medium',
                  business.isOpen ? 'text-success' : 'text-destructive',
                )}
              >
                {business.isOpen ? 'Accepting walk-ins' : 'Closed to new joins'}
              </span>
              <span className="text-muted-foreground">
                {' '}
                · ~{business.averageServiceMinutes} min average
              </span>
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/dashboard" className={cn(buttonVariants({ size: 'lg' }))}>
              Go to today
              <ArrowRight className="size-4 opacity-70" aria-hidden />
            </Link>
            <Link
              to={business ? '/dashboard/queue' : '/dashboard/settings'}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              {business ? 'Open queue' : 'Set up shop'}
            </Link>
          </div>

          <ul className="mt-10 divide-y divide-border border-y border-border">
            <QuickLink
              to="/dashboard/queue"
              icon={ListOrdered}
              label="Queue board"
              hint="Call next and move tickets"
            />
            <QuickLink
              to="/dashboard/settings"
              icon={Settings2}
              label="Shop settings"
              hint="Hours, slug, and guest link"
            />
          </ul>
        </div>

        <div className="lg:pt-2">
          <HomeFloorPreview />
        </div>
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon: Icon,
  label,
  hint,
}: {
  to: string
  icon: typeof ListOrdered
  label: string
  hint: string
}) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-3 py-3.5 transition-colors hover:text-foreground"
      >
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">{label}</span>
          <span className="block text-xs text-muted-foreground">{hint}</span>
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </Link>
    </li>
  )
}
