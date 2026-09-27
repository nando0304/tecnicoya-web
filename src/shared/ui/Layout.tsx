import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn, type Tone } from '@/shared/lib'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-3xl text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** Título de una sección dentro de una página (h2), con acciones opcionales a la derecha. */
export function SectionHeader({ title, actions, className }: { title: string; actions?: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {actions}
    </div>
  )
}

interface PanelProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Tarjeta blanca con borde suave, la superficie base de todas las pantallas. */
export function Panel({ title, description, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section className={cn('rounded-box border border-base-300 bg-base-100 shadow-xs', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-8 sm:pt-7">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-5 sm:p-8', title && 'pt-4 sm:pt-5', bodyClassName)}>{children}</div>
    </section>
  )
}

/** Valor de solo lectura con la misma forma que un campo del formulario (vista "Datos personales"). */
export function ReadOnlyField({ label, value, className }: { label: string; value?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-medium text-base-content/90">{label}</span>
      <div className="flex min-h-11 items-center rounded-field border border-base-300 bg-base-200 px-4 py-2.5 text-sm">
        {value || <span className="text-muted">No registrado</span>}
      </div>
    </div>
  )
}

const TONOS_ICONO: Record<Tone, string> = {
  neutral: 'bg-base-200 text-muted',
  primary: 'bg-primary-soft text-primary',
  info: 'bg-info/10 text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning/20 text-secondary',
  error: 'bg-error/10 text-error',
}

interface StatCardProps {
  label: string
  value: ReactNode
  icon: LucideIcon
  tone?: Tone
  hint?: string
}

export function StatCard({ label, value, icon: Icon, tone = 'primary', hint }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-box border border-base-300 bg-base-100 p-5 shadow-xs">
      <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', TONOS_ICONO[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  )
}

interface TabsProps<T extends string> {
  tabs: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
  className?: string
}

/** Pestañas subrayadas, como en el diseño del perfil. */
export function Tabs<T extends string>({ tabs, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cn('overflow-x-auto border-b border-base-300', className)}>
      <div role="tablist" className="flex min-w-max gap-6">
        {tabs.map((tab) => {
          const activa = tab.id === value
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => onChange(tab.id)}
              className={cn(
                '-mb-px border-b-2 pb-3 text-sm font-medium transition-colors sm:text-base',
                activa ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-base-content',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
