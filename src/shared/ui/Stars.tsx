import { Star } from 'lucide-react'
import { cn } from '@/shared/lib'

export function Stars({ value, className }: { value: number; className?: string }) {
  const llenas = Math.round(value)
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('size-4', n <= llenas ? 'fill-accent text-accent' : 'fill-base-300 text-base-300')}
          aria-hidden
        />
      ))}
    </span>
  )
}

interface RatingInputProps {
  value: number
  onChange: (value: number) => void
  name: string
}

/** Selector de 1 a 5 estrellas accesible con teclado (grupo de radios). */
export function RatingInput({ value, onChange, name }: RatingInputProps) {
  const etiquetas = ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
  return (
    <div className="flex items-center gap-3">
      <div role="radiogroup" aria-label="Puntuación" className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="relative cursor-pointer" title={etiquetas[n - 1]}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <Star
              className={cn(
                'size-8 transition-transform hover:scale-110 peer-focus-visible:rounded peer-focus-visible:outline-2 peer-focus-visible:outline-primary',
                n <= value ? 'fill-accent text-accent' : 'fill-base-200 text-base-300',
              )}
              aria-hidden
            />
            <span className="sr-only">{`${n} - ${etiquetas[n - 1]}`}</span>
          </label>
        ))}
      </div>
      {value > 0 && <span className="text-sm font-medium text-muted">{etiquetas[value - 1]}</span>}
    </div>
  )
}
