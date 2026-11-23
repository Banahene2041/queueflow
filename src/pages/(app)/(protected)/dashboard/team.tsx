import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useUserLookup } from 'deepspace'
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  buttonVariants,
  useToast,
} from '@/components/ui'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { callAction } from '@/lib/actions'
import { cn } from '@/lib/utils'
import type { MembershipRole, TeamMember } from '@/types/queue'

export default function DashboardTeamPage() {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const { business, membership, loading: bizLoading } = useMyBusiness()
  const { getName } = useUserLookup()
  const [targetUserId, setTargetUserId] = useState('')
  const [role, setRole] = useState<MembershipRole>('staff')
  const [busy, setBusy] = useState(false)

  const { records, status } = useQuery<TeamMember>('team_members', {
    where: { teamId: business?.id ?? '__none__', status: 'active' },
    limit: 100,
  })

  const members = useMemo(() => records, [records])
  const isAdmin = membership?.role === 'admin'

  async function onInvite(e: FormEvent) {
    e.preventDefault()
    if (!business || !isAdmin) return
    setBusy(true)
    const result = await callAction('inviteStaff', {
      businessId: business.id,
      targetUserId: targetUserId.trim(),
      role,
    })
    setBusy(false)
    if (!result.success) {
      error('Couldn’t add staff', result.error)
      return
    }
    success('Staff updated')
    setTargetUserId('')
  }

  if (bizLoading) return <div className="h-40 animate-pulse rounded-lg bg-muted" />

  if (!business) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <p className="font-display text-lg font-semibold">Create a business first</p>
        <button
          type="button"
          className={cn(buttonVariants(), 'mt-5')}
          onClick={() => navigate('/dashboard/settings')}
        >
          Settings
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff who can run the queue for {business.name}.
        </p>
      </header>

      {status === 'loading' ? (
        <div className="h-24 animate-pulse rounded-lg bg-muted" />
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
              {isAdmin && row.data.userId !== membership?.userId && (
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
              )}
            </li>
          ))}
        </ul>
      )}

      {isAdmin ? (
        <form onSubmit={onInvite} className="space-y-4 rounded-lg border border-border bg-card p-4">
          <p className="font-display text-sm font-semibold">Add staff</p>
          <p className="text-xs text-muted-foreground">
            Paste a DeepSpace user id for someone who has already signed into this app.
          </p>
          <div className="space-y-2">
            <Label htmlFor="uid">User id</Label>
            <Input
              id="uid"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="user_…"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MembershipRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" loading={busy}>
            Add to team
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Only business admins can manage the team.</p>
      )}
    </div>
  )
}
