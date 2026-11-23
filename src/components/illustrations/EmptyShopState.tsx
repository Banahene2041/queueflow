import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui'

export function EmptyShopState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-card',
        className,
      )}
    >
      <div className="relative grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:p-8">
        <div className="order-2 sm:order-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            First open
          </p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <button
            type="button"
            onClick={onAction}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-5')}
          >
            {actionLabel}
          </button>
        </div>

        <div className="order-1 sm:order-2">
          <div className="relative overflow-hidden rounded-md border border-border bg-muted/40">
            <img
              src="/illustrations/empty-shop.jpg"
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
