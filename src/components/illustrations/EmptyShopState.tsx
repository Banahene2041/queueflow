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
        'relative overflow-hidden rounded-2xl border border-border bg-card',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 qf-empty-sheen" />
      <div className="relative grid gap-6 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:p-8">
        <div className="qf-fade-up order-2 sm:order-1">
          <p className="font-display text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            First open
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <button
            type="button"
            onClick={onAction}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}
          >
            {actionLabel}
          </button>
        </div>

        <div className="qf-fade-up qf-fade-up-delay order-1 sm:order-2">
          <div className="qf-float relative overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src="/illustrations/empty-shop.jpg"
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-4 pb-3 pt-10">
              <p className="text-xs font-medium text-white/90">Chair ready · waiting on setup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
