import { Link, NavLink, Outlet } from 'react-router-dom'
import { signOut, useAuthProfileReady } from 'deepspace'
import { Activity, LayoutDashboard, ListOrdered, LogOut, Settings, Users } from 'lucide-react'
import { useState } from 'react'
import { StaffAuthOverlay } from '@/components/auth/StaffAuthOverlay'
import { APP_NAME } from '../../constants'
import { cn } from '../../lib/utils'
import { Avatar, AvatarFallback, AvatarImage, Button } from '../ui'

const items = [
  { to: '/dashboard', label: 'Today', icon: LayoutDashboard, end: true },
  { to: '/dashboard/queue', label: 'Queue', icon: ListOrdered },
  { to: '/dashboard/activity', label: 'Activity', icon: Activity },
  { to: '/dashboard/team', label: 'Team', icon: Users },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const

export function DashboardShell() {
  const { isSignedIn, user } = useAuthProfileReady({ requireUser: true })
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-shell text-foreground">
      <aside className="hidden h-full w-[220px] shrink-0 flex-col border-r border-border bg-shell-panel md:flex">
        <div className="shrink-0 px-5 py-5">
          <Link to="/dashboard" className="font-display text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Floor console</p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-secondary font-semibold text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4 shrink-0 opacity-70" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          {isSignedIn && user ? (
            <div className="flex items-center gap-2 rounded-md px-2 py-2">
              <Avatar className="size-7">
                <AvatarImage src={user.imageUrl ?? undefined} referrerPolicy="no-referrer" />
                <AvatarFallback className="text-[10px]">
                  {(user.name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user.name || user.email}</p>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="size-3" aria-hidden />
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Button size="sm" className="w-full" onClick={() => setShowAuth(true)}>
              Sign in
            </Button>
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-shell-panel px-4 py-3 md:hidden">
          <Link to="/dashboard" className="font-display font-semibold">
            {APP_NAME}
          </Link>
          {isSignedIn ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs text-muted-foreground"
            >
              Sign out
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border bg-shell-panel px-2 py-2 md:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-xs',
                  isActive ? 'bg-secondary font-semibold' : 'text-muted-foreground',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      {showAuth ? <StaffAuthOverlay onClose={() => setShowAuth(false)} /> : null}
    </div>
  )
}
