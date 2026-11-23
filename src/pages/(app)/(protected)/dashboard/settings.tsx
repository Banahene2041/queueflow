import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BusinessSettingsModal } from '@/components/forms/BusinessSettingsModal'
import { Button, buttonVariants } from '@/components/ui'
import { callAction } from '@/lib/actions'
import { cn } from '@/lib/utils'
import type { Business } from '@/types/queue'

type MyBusinessResponse = {
  business: (Business & { id: string }) | null
}

export default function DashboardSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<(Business & { id: string }) | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function reload() {
    setLoading(true)
    const result = await callAction<MyBusinessResponse>('getMyBusiness')
    if (result.success) {
      setBusiness(result.data.business)
    }
    setLoading(false)
  }

  useEffect(() => {
    void reload()
  }, [])

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Shop profile and public queue link. Account sign-out is on{' '}
            <Link to="/settings" className="underline-offset-4 hover:underline">
              /settings
            </Link>
            .
          </p>
        </div>
        {!loading ? (
          <Button onClick={() => setModalOpen(true)}>
            {business ? 'Edit shop' : 'Create shop'}
          </Button>
        ) : null}
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : business ? (
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          <Row label="Name" value={business.name} />
          <Row label="Slug" value={business.slug} />
          <Row
            label="Status"
            value={business.isOpen ? 'Accepting walk-ins' : 'Closed to new joins'}
          />
          <Row label="Avg. service" value={`${business.averageServiceMinutes} min`} />
          {business.address ? <Row label="Address" value={business.address} /> : null}
          {business.description ? (
            <Row label="Description" value={business.description} />
          ) : null}
          <div className="px-4 py-3 text-sm">
            <p className="text-muted-foreground">Guest link</p>
            <Link
              to={`/queue/${business.slug}`}
              className={cn(
                buttonVariants({ variant: 'link' }),
                'h-auto px-0 text-primary',
              )}
            >
              /queue/{business.slug}
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card px-5 py-10 text-center">
          <p className="font-display text-lg font-semibold">No shop yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a profile to unlock the public queue and staff console.
          </p>
          <Button className="mt-5" onClick={() => setModalOpen(true)}>
            Create shop
          </Button>
        </div>
      )}

      <BusinessSettingsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => void reload()}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <p className="shrink-0 text-muted-foreground">{label}</p>
      <p className="min-w-0 text-right font-medium">{value}</p>
    </div>
  )
}
