/**
 * Gated routes. Any file under src/pages/(app)/(protected)/ requires sign-in.
 * The `(protected)` folder is a Generouted route group — parentheses mean
 * it doesn't appear in the URL. For a dynamic page that does NOT require
 * sign-in, put it directly under src/pages/(app)/; for a static page, put it
 * at the top level of src/pages/.
 *
 * Children may call data hooks like `useUser()` safely because the parent
 * (app)/_layout.tsx mounts <RecordProvider> above this layout.
 *
 * The `fallback` keeps signed-out visitors inside the app's own chrome
 * (without it, AuthGate shows the SDK's full-screen, non-dismissible
 * overlay). The sign-in overlay opens on demand and can be dismissed.
 */

import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { AuthGate } from 'deepspace'
import { StaffAuthOverlay } from '@/components/auth/StaffAuthOverlay'
import { Button } from '@/components/ui'
import { APP_NAME } from '@/constants'

export default function ProtectedLayout() {
  return (
    <AuthGate fallback={<StaffSignInPage />} redirectOnSignOut="/">
      <Outlet />
    </AuthGate>
  )
}

function StaffSignInPage() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="relative flex min-h-full bg-background">
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden lg:block">
        <img
          src="/illustrations/landing-hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1416]/85 via-[#0d1416]/25 to-[#0d1416]/40" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <p className="font-display text-sm font-semibold tracking-wide">{APP_NAME}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
            One live queue for the floor. Guests join from their phone; you call the next ticket.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <p className="font-display text-sm font-semibold tracking-tight text-primary">
            {APP_NAME}
          </p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">
            Staff sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Open the floor console to run today’s queue, manage the team, and keep every
            chair in sync.
          </p>

          <Button className="mt-8 w-full" size="lg" onClick={() => setShowAuth(true)}>
            Continue
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Use Google or GitHub — same account you use on DeepSpace.
          </p>

          <div className="mt-10 border-t border-border pt-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              ← Back to {APP_NAME}
            </Link>
          </div>
        </div>
      </div>

      {showAuth ? <StaffAuthOverlay onClose={() => setShowAuth(false)} /> : null}
    </div>
  )
}
