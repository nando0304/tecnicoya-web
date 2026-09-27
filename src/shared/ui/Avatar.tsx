import { cn, iniciales } from '@/shared/lib'

const TAMANOS = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
  xl: 'size-24 text-3xl sm:size-28',
}

interface AvatarProps {
  nombre: string
  size?: keyof typeof TAMANOS
  className?: string
}

export function Avatar({ nombre, size = 'md', className }: AvatarProps) {
  return (
    <span
      className={cn(
        'grid shrink-0 select-none place-items-center rounded-full bg-linear-to-br from-primary to-primary-strong font-semibold text-primary-content',
        TAMANOS[size],
        className,
      )}
      aria-hidden
    >
      {iniciales(nombre)}
    </span>
  )
}
