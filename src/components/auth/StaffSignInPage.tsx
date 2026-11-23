import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StaffAuthOverlay } from '@/components/auth/StaffAuthOverlay'
import { BrandMark } from '@/components/brand/BrandMark'
import { Button } from '@/components/ui'
import { APP_NAME } from '@/constants'

const perks = [
  'Live ticket board for every chair',
  'Guest join link — no app download',
  'Staff presence across stations',
]

export function StaffSignInPage() {
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="fixed inset-0 z-40 flex bg-[#f3f5f4] text-[#12181a]">
      {/* Visual plane */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[48%]">
        <img
          src="/illustrations/landing-hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0d1416]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1416]/90 via-transparent to-[#0d1416]/30" />

        <div className="absolute inset-x-0 top-0 p-8">
          <BrandMark to="/" tone="inverse" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-8 pb-10 text-white">
          <p className="font-display text-2xl font-semibold tracking-tight">
            Know your place
            <br />
            in line.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Walk-ins join from their phone. You run one live queue — call, serve, done.
          </p>
        </div>
      </div>

      {/* Form plane */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="lg:invisible">
            <BrandMark to="/" size="sm" />
          </div>
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Back to site
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center px-6 pb-16 sm:px-10">
          <div className="mx-auto w-full max-w-[22rem]">
            <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
              Staff access
            </p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
              Sign in to {APP_NAME}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Open today’s floor console. Guests keep their place; your team stays synced.
            </p>

            <Button className="mt-8 w-full" size="lg" onClick={() => setShowAuth(true)}>
              Continue with Google or GitHub
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Same DeepSpace account you already use.
            </p>

            <ul className="mt-10 space-y-2.5 border-t border-border pt-8">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70"
                    aria-hidden
                  />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mobile hero strip */}
        <div className="relative h-36 overflow-hidden border-t border-border lg:hidden">
          <img
            src="/illustrations/landing-hero.jpg"
            alt=""
            className="absolute inset-0 size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#0d1416]/50" />
          <p className="absolute inset-x-6 bottom-5 font-display text-lg font-semibold text-white">
            Floor-ready in a minute.
          </p>
        </div>
      </div>

      {showAuth ? <StaffAuthOverlay onClose={() => setShowAuth(false)} /> : null}
    </div>
  )
}
