import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/shared/lib'
import { useToastStore, type ToastTone } from './toast'

const ESTILOS: Record<ToastTone, { icon: typeof Info; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  error: { icon: XCircle, className: 'text-error' },
  info: { icon: Info, className: 'text-primary' },
}

export function Toaster() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="toast toast-end toast-bottom z-[1000] p-4" aria-live="polite">
      {items.map((item) => {
        const { icon: Icon, className } = ESTILOS[item.tone]
        return (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className="flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-box border border-base-300 bg-base-100 p-4 text-sm shadow-lg"
          >
            <Icon className={cn('mt-0.5 size-5 shrink-0', className)} aria-hidden />
            <p className="grow whitespace-normal">{item.message}</p>
            <button
              type="button"
              className="btn btn-square btn-ghost btn-xs"
              onClick={() => dismiss(item.id)}
              aria-label="Cerrar notificación"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
