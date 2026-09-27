import type { ReactNode } from 'react'
import { cn, type EnumDef, type Tone } from '@/shared/lib'

const TONOS: Record<Tone, string> = {
  neutral: 'bg-base-200 text-muted ring-base-300',
  primary: 'bg-primary-soft text-primary ring-primary/15',
  info: 'bg-info/10 text-info ring-info/20',
  success: 'bg-success-soft text-success ring-success/20',
  warning: 'bg-warning/20 text-secondary ring-warning/40',
  error: 'bg-error/10 text-error ring-error/20',
}

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function Badge({ tone = 'neutral', icon, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        TONOS[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Muestra un valor de enum de la API con su etiqueta y color. */
export function StatusBadge<K extends string>({ def, value }: { def: EnumDef<K>; value: K }) {
  return <Badge tone={def.tone(value)}>{def.label(value)}</Badge>
}
