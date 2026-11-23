import { NavLink, Outlet } from 'react-router-dom'
import { signOut, useAuthProfileReady } from 'deepspace'
import {
  Activity,
  ChevronUp,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { StaffAuthOverlay } from '@/components/auth/StaffAuthOverlay'
import { BrandMark } from '@/components/brand/BrandMark'
import { cn } from '../../lib/utils'
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
} from '../ui'

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
          <BrandMark to="/dashboard" size="md" />
          <p className="mt-2 text-xs text-muted-foreground">Floor console</p>
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
            <AccountMenu
              name={user.name}
              email={user.email}
              imageUrl={user.imageUrl}
              side="top"
              align="start"
              triggerClassName="w-full"
            />
          ) : (
            <Button size="sm" className="w-full" onClick={() => setShowAuth(true)}>
              Sign in
            </Button>
          )}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-shell-panel px-4 py-3 md:hidden">
          <BrandMark to="/dashboard" size="sm" />
          {isSignedIn && user ? (
            <AccountMenu
              name={user.name}
              email={user.email}
              imageUrl={user.imageUrl}
              side="bottom"
              align="end"
              compact
            />
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

function AccountMenu({
  name,
  email,
  imageUrl,
  side,
  align,
  compact = false,
  triggerClassName,
}: {
  name?: string | null
  email?: string | null
  imageUrl?: string | null
  side: 'top' | 'bottom'
  align: 'start' | 'end'
  compact?: boolean
  triggerClassName?: string
}) {
  const label = name || email || 'Account'
  const initial = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Account menu"
            className={cn(
              'group flex items-center gap-2 rounded-md border border-transparent text-left transition-colors hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              compact ? 'p-0.5' : 'w-full px-2 py-2',
              triggerClassName,
            )}
          >
            <Avatar className={cn(compact ? 'size-8' : 'size-7')}>
              <AvatarImage src={imageUrl ?? undefined} referrerPolicy="no-referrer" />
              <AvatarFallback className="text-[10px]">{initial}</AvatarFallback>
            </Avatar>
            {!compact ? (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">Account</p>
                </div>
                <ChevronUp
                  className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[popup-open]:rotate-180"
                  aria-hidden
                />
              </>
            ) : null}
          </button>
        }
      />
      <DropdownMenuContent side={side} align={align} className="w-56">
        <DropdownMenuLabel>
          <div className="truncate font-medium text-foreground">{name || 'Signed in'}</div>
          {email ? (
            <div className="truncate text-xs font-normal text-muted-foreground">{email}</div>
          ) : null}
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
  )
}
