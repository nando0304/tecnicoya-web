import { Wrench } from 'lucide-react'
import { cn } from '@/shared/lib'

interface LogoProps {
  /** Oculta el nombre y deja solo el ícono. */
  compact?: boolean
  className?: string
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-content shadow-md shadow-primary/30">
        <Wrench className="size-5" strokeWidth={2.25} aria-hidden />
      </span>
      {compact ? (
        <span className="sr-only">TécnicoYa</span>
      ) : (
        <span className="text-xl font-extrabold tracking-tight text-secondary">
          Técnico<span className="text-primary">Ya</span>
        </span>
      )}
    </span>
  )
}
