/* home pattern: data-forward — jump straight into today's floor console */
import { Link } from 'react-router-dom'
import { useAuthProfileReady } from 'deepspace'
import { APP_NAME } from '../../../constants'
import { buttonVariants } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const { user } = useAuthProfileReady({ requireUser: true })

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-16">
      <p className="font-display text-sm font-semibold tracking-[0.18em] text-primary uppercase">
        {APP_NAME}
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
        {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Floor console'}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Open today’s queue, call the next guest, and keep every chair in sync.
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
    </div>
  )
}
