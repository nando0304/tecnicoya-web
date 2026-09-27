import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  danger = true,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="text-sm text-muted">{message}</div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          type="button"
          className={cn('btn', danger ? 'btn-error' : 'btn-primary')}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
