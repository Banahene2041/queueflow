import { useEffect } from 'react'
import { useAuth, usePresenceRoom, getUserColor } from 'deepspace'
import { cn } from '@/lib/utils'

export function StaffPresence({
  businessId,
  role,
}: {
  businessId: string
  role?: string
}) {
  const { isSignedIn, userId } = useAuth()
  const { peers, connected, updateState } = usePresenceRoom(`business:${businessId}`)

  useEffect(() => {
    if (!isSignedIn || !userId) return
    updateState({
      page: 'queue',
      role: role ?? 'staff',
      at: Date.now(),
    })
  }, [isSignedIn, userId, role, updateState])

  if (!isSignedIn) return null

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium',
          connected ? 'text-muted-foreground' : 'text-warning',
        )}
      >
        <span
          className={cn(
            'size-1.5 rounded-full',
            connected ? 'qf-live-dot bg-success' : 'bg-warning',
          )}
        />
        {connected ? 'Floor online' : 'Reconnecting…'}
      </span>
      <div className="flex -space-x-1.5">
        {peers.slice(0, 6).map((peer) => {
          const color = getUserColor(peer.userId)
          const initial = (peer.userName?.[0] ?? '?').toUpperCase()
          return (
            <span
              key={peer.userId}
              title={peer.userName || peer.userId}
              className="inline-flex size-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {initial}
            </span>
          )
        })}
      </div>
      {peers.length > 0 && (
        <span className="text-xs text-muted-foreground">
          {peers.length === 1
            ? `${peers[0].userName || '1 staff'} also here`
            : `${peers.length} staff on floor`}
        </span>
      )}
    </div>
  )
}
