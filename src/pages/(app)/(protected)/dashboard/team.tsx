import { useMemo, useState } from 'react'
import { useQuery, useUserLookup } from 'deepspace'
import { BusinessSettingsModal } from '@/components/forms/BusinessSettingsModal'
import { InviteStaffModal } from '@/components/forms/InviteStaffModal'
import { EmptyShopState } from '@/components/illustrations/EmptyShopState'
import { Button, useToast } from '@/components/ui'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { callAction } from '@/lib/actions'
import type { TeamMember } from '@/types/queue'

export default function DashboardTeamPage() {
  const { success, error } = useToast()
  const { business, membership, loading: bizLoading, refresh } = useMyBusiness()
  const { getName } = useUserLookup()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { records, status } = useQuery<TeamMember>('team_members', {
    where: { teamId: business?.id ?? '__none__', status: 'active' },
    limit: 100,
  })

  const members = useMemo(() => records, [records])
  const isAdmin = membership?.role === 'admin'

  if (bizLoading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />

  if (!business) {
    return (
      <>
        <EmptyShopState
          title="Create a business first"
          description="Set up your shop profile, then invite staff who can run the live queue."
          actionLabel="Create shop"
          onAction={() => setSettingsOpen(true)}
        />
        <BusinessSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onSaved={() => void refresh()}
        />
      </>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Team</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff who can run the queue for {business.name}.
          </p>
        </div>
        {isAdmin ? (
          <Button onClick={() => setInviteOpen(true)}>Add staff</Button>
        ) : null}
      </header>

      {status === 'loading' ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
      ) : members.length === 0 ? (
        <div className="rounded-lg border border-border bg-card px-5 py-10 text-center">
          <p className="font-display text-sm font-semibold">No team members yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? 'Add someone who has already signed into this app.' : 'Ask an admin to invite you.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {members.map((row) => (
            <li key={row.recordId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {getName(row.data.userId) || row.data.userId}
                </p>
                <p className="text-xs capitalize text-muted-foreground">{row.data.role}</p>
              </div>
              {isAdmin && row.data.userId !== membership?.userId ? (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() =>
                    void callAction('removeStaff', {
                      businessId: business.id,
                      membershipId: row.recordId,
                    }).then((r) =>
                      r.success ? success('Removed') : error('Remove failed', r.error),
                    )
                  }
                >
                  Remove
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {!isAdmin ? (
        <p className="text-sm text-muted-foreground">Only business admins can manage the team.</p>
      ) : null}

      <InviteStaffModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        businessId={business.id}
      />
    </div>
  )
}
