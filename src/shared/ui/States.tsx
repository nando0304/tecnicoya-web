import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { getErrorMessage } from '@/shared/api'
import { cn } from '@/shared/lib'

export function LoadingState({ label = 'Cargando…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-muted', className)} role="status">
      <span className="loading loading-spinner loading-lg text-primary" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center" role="alert">
      <span className="grid size-12 place-items-center rounded-full bg-error/10 text-error">
        <AlertTriangle className="size-6" />
      </span>
      <div>
        <p className="font-semibold">No pudimos cargar la información</p>
        <p className="mt-1 max-w-md text-sm text-muted">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-outline btn-sm" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-14 text-center', className)}>
      <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-1 max-w-md text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
