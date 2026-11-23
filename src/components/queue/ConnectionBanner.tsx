import type { ConnectionStatus } from 'deepspace'
import { cn } from '@/lib/utils'

export function ConnectionBanner({ status }: { status: ConnectionStatus }) {
  if (status === 'connected') return null

  const label =
    status === 'connecting'
      ? 'Connecting…'
      : status === 'reconnecting'
        ? 'Reconnecting…'
        : 'Connection error'

  return (
    <div
      role="status"
      className={cn(
        'rounded-md px-3 py-2 text-center text-xs font-medium',
        status === 'error'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-warning/10 text-warning',
      )}
    >
      {label}
    </div>
  )
}
