import { Link } from 'react-router-dom'
import { APP_NAME } from '@/constants'
import { cn } from '@/lib/utils'

export function BrandMark({
  to = '/home',
  tone = 'default',
  size = 'md',
  className,
}: {
  to?: string
  tone?: 'default' | 'inverse'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const mark = size === 'lg' ? 'size-8 text-sm' : size === 'sm' ? 'size-6 text-[10px]' : 'size-7 text-xs'
  const word =
    size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-sm' : 'text-[15px]'

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center gap-2.5 font-display font-semibold tracking-tight',
        tone === 'inverse' ? 'text-white' : 'text-foreground',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md font-semibold',
          mark,
          tone === 'inverse'
            ? 'bg-white/15 text-white ring-1 ring-inset ring-white/20'
            : 'bg-primary text-primary-foreground',
        )}
        aria-hidden
      >
        Q
      </span>
      <span className={word}>{APP_NAME}</span>
    </Link>
  )
}
