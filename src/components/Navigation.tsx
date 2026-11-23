/**
 * Top nav — branded app header. Keep the data-testid hooks
 * (`app-navigation`, `nav-sign-in-button`, `nav-user-name`, `nav-user-email`)
 * — the shipped tests rely on them.
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthProfileReady, signOut } from 'deepspace'
import { StaffAuthOverlay } from '@/components/auth/StaffAuthOverlay'
import { BrandMark } from '@/components/brand/BrandMark'
import { ChevronDown, LogOut, Menu, X } from 'lucide-react'
import type { Role } from '../constants'
import { nav } from '../nav'
import { cn } from '../lib/utils'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui'

export default function Navigation() {
  const { isLoaded, isSignedIn, user, userLoading } = useAuthProfileReady({ requireUser: true })
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const profileReady = !isSignedIn || (!userLoading && !!user)
  const userRole = (user?.role ?? 'anonymous') as Role | 'anonymous'

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const visibleNav = nav.filter((item) => {
    if (item.devOnly && !import.meta.env.DEV) return false
    if (!item.roles) return true
    if (!profileReady) return false
    if (userRole === 'admin') return true
    return item.roles.includes(userRole as Role)
  })

  const navLink = (item: (typeof nav)[number], mobile = false) => {
    const active = location.pathname.startsWith(item.path)
    return (
      <Link
        key={item.path}
        to={item.path}
        aria-current={active ? 'page' : undefined}
        className={cn(
          mobile
            ? 'rounded-md px-3 py-2.5 text-sm'
            : 'relative px-3 py-1.5 text-sm transition-colors',
          active
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:text-foreground',
          mobile && active && 'bg-secondary',
          !mobile &&
            active &&
            'after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-primary',
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <>
      <header
        data-testid="app-navigation"
        className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <BrandMark to="/home" size="sm" />

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {visibleNav.map((item) => navLink(item))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {!isLoaded ? null : isSignedIn && !profileReady ? (
              <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5">
                <div className="size-7 animate-pulse rounded-full bg-muted" />
                <div className="hidden h-3.5 w-20 animate-pulse rounded-md bg-muted sm:block" />
              </div>
            ) : isSignedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      aria-label="Account menu"
                      className="group flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 text-sm transition-colors hover:bg-muted/60"
                    >
                      <Avatar className="size-7">
                        <AvatarImage
                          src={user.imageUrl ?? undefined}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-[11px]">
                          {(user.name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        data-testid="nav-user-name"
                        className="hidden max-w-[140px] truncate text-foreground sm:inline"
                      >
                        {user.name || user.email}
                      </span>
                      <ChevronDown
                        className="size-3.5 text-muted-foreground transition-transform duration-150 group-data-[popup-open]:rotate-180"
                        aria-hidden
                      />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="truncate font-medium text-foreground">
                      {user.name || 'Signed in'}
                    </div>
                    <div
                      data-testid="nav-user-email"
                      className="truncate text-xs font-normal text-muted-foreground"
                    >
                      {user.email}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      void signOut()
                    }}
                  >
                    <LogOut aria-hidden />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                data-testid="nav-sign-in-button"
                size="sm"
                onClick={() => setShowAuthModal(true)}
              >
                Sign in
              </Button>
            )}

            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="size-4" aria-hidden />
              ) : (
                <Menu className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <nav
            className="flex flex-col gap-0.5 border-t border-border px-3 py-3 md:hidden"
            aria-label="Mobile"
          >
            {visibleNav.map((item) => navLink(item, true))}
          </nav>
        ) : null}
      </header>

      {showAuthModal ? <StaffAuthOverlay onClose={() => setShowAuthModal(false)} /> : null}
    </>
  )
}
