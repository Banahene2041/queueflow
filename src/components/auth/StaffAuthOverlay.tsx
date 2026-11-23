import { AuthOverlay } from 'deepspace'
import { APP_NAME } from '@/constants'

/** Branded DeepSpace AuthOverlay for staff entry points. */
export function StaffAuthOverlay({ onClose }: { onClose?: () => void }) {
  return (
    <AuthOverlay
      onClose={onClose}
      providers={['google', 'github']}
      title={`Sign in to ${APP_NAME}`}
      description="Staff access to your live floor console."
      logo={
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          {APP_NAME}
        </span>
      }
    />
  )
}
