import { useUsuarioActual } from '@/entities/session'
import type { Tecnico } from '@/entities/tecnico'
import { ServicioForm } from '@/features/servicio-form'
import { Modal } from '@/shared/ui'

interface SolicitarServicioModalProps {
  open: boolean
  onClose: () => void
  /** Técnico elegido; sin él, la solicitud queda abierta a cualquier técnico. */
  tecnico?: Tecnico | null
}

export function SolicitarServicioModal({ open, onClose, tecnico }: SolicitarServicioModalProps) {
  const usuario = useUsuarioActual()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Solicitar servicio"
      description={tecnico ? `Tu solicitud llegará directamente a ${tecnico.nombreCompleto}.` : 'Describe el problema y un técnico verificado tomará tu solicitud.'}
      size="lg"
    >
      <ServicioForm
        modo="cliente"
        clienteId={usuario.idUsuario}
        tecnicoFijo={tecnico ?? undefined}
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  )
}
