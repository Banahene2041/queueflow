import { Link, useNavigate } from 'react-router-dom'
import { QueueBoard } from '@/components/dashboard/QueueBoard'
import { EmptyShopState } from '@/components/illustrations/EmptyShopState'
import { buttonVariants } from '@/components/ui'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { cn } from '@/lib/utils'

export default function DashboardQueuePage() {
  const navigate = useNavigate()
  const { business, membership, loading, error } = useMyBusiness()

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Waiting on the left. Chair on the right. One tap to move people through.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg bg-muted" />
          <div className="h-72 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !business ? (
        <EmptyShopState
          title="Set up your shop first"
          description="Create a business profile, then guests can join from their phones while you run the live queue."
          actionLabel="Business settings"
          onAction={() => navigate('/dashboard/settings')}
        />
      ) : (
        <QueueBoard
          businessId={business.id}
          businessSlug={business.slug}
          membershipRole={membership?.role}
        />
      )}

      {business && (
        <Link
          to="/dashboard/settings"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'inline-flex')}
        >
          Settings
        </Link>
      )}
    </div>
  )
}
