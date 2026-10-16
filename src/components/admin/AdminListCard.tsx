import { ReactNode } from 'react'

interface AdminListCardProps {
  title: string
  subtitle?: string
  onClick?: () => void
  badges?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  className?: string
}

export function AdminListCard({
  title,
  subtitle,
  onClick,
  badges,
  children,
  actions,
  className = '',
}: AdminListCardProps) {
  const interactive = Boolean(onClick)

  return (
    <article
      className={`rounded-xl border border-border-light bg-bg-card p-4 shadow-sm ${interactive ? 'cursor-pointer active:bg-bg-secondary/40' : ''} ${className}`}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary truncate">{title}</p>
          {subtitle ? <p className="text-sm text-text-secondary mt-0.5 break-words">{subtitle}</p> : null}
        </div>
        {badges ? <div className="flex flex-col items-end gap-1 shrink-0">{badges}</div> : null}
      </div>

      {children ? <div className="mt-3 text-sm text-text-secondary space-y-1">{children}</div> : null}

      {actions ? (
        <div
          className="mt-4 flex flex-wrap gap-2"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}
    </article>
  )
}
