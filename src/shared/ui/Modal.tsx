import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

const ANCHOS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl',
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: keyof typeof ANCHOS
  children: ReactNode
}

/** Diálogo nativo (<dialog>): foco atrapado, Escape y fondo accesibles sin librerías. */
export function Modal({ open, onClose, title, description, size = 'md', children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const tituloId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose} aria-labelledby={tituloId}>
      <div className={cn('modal-box w-full max-h-[92vh] p-0', ANCHOS[size])}>
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id={tituloId} className="text-lg font-semibold">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={onClose} aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </header>
        {/* El contenido se monta al abrir: cada apertura empieza con el formulario limpio */}
        <div className="px-5 py-5 sm:px-6">{open && children}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" tabIndex={-1}>
          Cerrar
        </button>
      </form>
    </dialog>
  )
}
