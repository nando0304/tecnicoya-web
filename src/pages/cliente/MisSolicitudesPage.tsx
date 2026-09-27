import { Link } from '@tanstack/react-router'
import { ClipboardList, Eye, Pencil, Plus, Receipt, Star, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCalificaciones } from '@/entities/calificacion'
import { toServicioRequest, useServicios, useUpdateServicio, type Servicio } from '@/entities/servicio'
import { useUsuarioActual } from '@/entities/session'
import { CalificacionForm } from '@/features/calificacion-form'
import { EvidenciaPagoForm } from '@/features/evidencia-pago-form'
import { ServicioForm } from '@/features/servicio-form'
import { cn } from '@/shared/lib'
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, PageHeader, Stars, ejecutar } from '@/shared/ui'
import { ServicioCard } from '@/widgets/servicio-card'
import { SolicitarServicioModal } from '@/widgets/tecnico-card'

type Filtro = 'activas' | 'finalizadas' | 'canceladas' | 'todas'

const FILTROS: { id: Filtro; label: string; incluye: (s: Servicio) => boolean }[] = [
  { id: 'activas', label: 'Activas', incluye: (s) => ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO'].includes(s.estadoServicio) },
  { id: 'finalizadas', label: 'Finalizadas', incluye: (s) => s.estadoServicio === 'FINALIZADO' },
  { id: 'canceladas', label: 'Canceladas', incluye: (s) => s.estadoServicio === 'CANCELADO' },
  { id: 'todas', label: 'Todas', incluye: () => true },
]

type Dialogo =
  | { tipo: 'editar'; servicio: Servicio }
  | { tipo: 'calificar'; servicio: Servicio }
  | { tipo: 'pago'; servicio: Servicio }
  | { tipo: 'cancelar'; servicio: Servicio }

export function MisSolicitudesPage() {
  const usuario = useUsuarioActual()
  const { data, isLoading, error, refetch } = useServicios()
  const calificaciones = useCalificaciones()
  const actualizar = useUpdateServicio()

  const [filtro, setFiltro] = useState<Filtro>('activas')
  const [nueva, setNueva] = useState(false)
  const [dialogo, setDialogo] = useState<Dialogo | null>(null)
  const [cancelando, setCancelando] = useState(false)

  const mias = useMemo(
    () => (data ?? []).filter((s) => s.clienteId === usuario.idUsuario).sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)),
    [data, usuario.idUsuario],
  )
  const calificacionPorServicio = useMemo(() => new Map(calificaciones.data?.map((c) => [c.servicioId, c])), [calificaciones.data])
  const visibles = mias.filter(FILTROS.find((f) => f.id === filtro)!.incluye)
  const cerrar = () => setDialogo(null)

  const cancelar = async () => {
    if (dialogo?.tipo !== 'cancelar') return
    setCancelando(true)
    const ok = await ejecutar(
      () => actualizar.mutateAsync({ id: dialogo.servicio.idServicio, body: toServicioRequest(dialogo.servicio, { estadoServicio: 'CANCELADO' }) }),
      { exito: 'Solicitud cancelada' },
    )
    setCancelando(false)
    if (ok) cerrar()
  }

  const acciones = (s: Servicio) => {
    const calificada = calificacionPorServicio.has(s.idServicio)
    const editable = s.estadoServicio === 'PENDIENTE' || s.estadoServicio === 'ASIGNADO'
    return (
      <>
        {s.estadoServicio === 'FINALIZADO' && !calificada && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setDialogo({ tipo: 'calificar', servicio: s })}>
            <Star className="size-4" /> Calificar
          </button>
        )}
        {editable && (
          <button type="button" className="btn btn-outline btn-sm border-base-300" onClick={() => setDialogo({ tipo: 'editar', servicio: s })}>
            <Pencil className="size-4" /> Editar
          </button>
        )}
        {s.tecnicoId !== null && s.estadoServicio !== 'CANCELADO' && s.estadoServicio !== 'PENDIENTE' && (
          <button type="button" className="btn btn-outline btn-sm border-base-300" onClick={() => setDialogo({ tipo: 'pago', servicio: s })}>
            <Receipt className="size-4" /> Registrar pago
          </button>
        )}
        {s.tecnicoId !== null && (
          <Link to="/tecnicos/$tecnicoId" params={{ tecnicoId: String(s.tecnicoId) }} className="btn btn-ghost btn-sm">
            <Eye className="size-4" /> Ver técnico
          </Link>
        )}
        {editable && (
          <button type="button" className="btn btn-ghost btn-sm text-error hover:bg-error/10 sm:ml-auto" onClick={() => setDialogo({ tipo: 'cancelar', servicio: s })}>
            <XCircle className="size-4" /> Cancelar
          </button>
        )}
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Mis solicitudes"
        description="Sigue el avance de tus servicios, califica al técnico y registra tus pagos."
        actions={
          <button type="button" className="btn btn-primary shadow-md shadow-primary/25" onClick={() => setNueva(true)}>
            <Plus className="size-4" /> Nueva solicitud
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              filtro === f.id ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 text-muted hover:border-primary/40',
            )}
          >
            {f.label} ({mias.filter(f.incluye).length})
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : visibles.length === 0 ? (
        <div className="rounded-box border border-base-300 bg-base-100">
          <EmptyState
            icon={ClipboardList}
            title="No hay solicitudes en esta lista"
            action={
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setNueva(true)}>
                Crear una solicitud
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibles.map((s) => {
            const calificacion = calificacionPorServicio.get(s.idServicio)
            return (
              <ServicioCard
                key={s.idServicio}
                servicio={s}
                perspectiva="cliente"
                acciones={acciones(s)}
                extra={
                  calificacion && (
                    <div className="mt-4 rounded-lg bg-base-200/70 p-3 text-sm">
                      <p className="mb-1 text-xs font-medium text-muted">Tu calificación</p>
                      <Stars value={calificacion.puntuacion} />
                      {calificacion.comentario && <p className="mt-1 text-muted">“{calificacion.comentario}”</p>}
                    </div>
                  )
                }
              />
            )
          })}
        </div>
      )}

      <SolicitarServicioModal open={nueva} onClose={() => setNueva(false)} />

      <Modal open={dialogo?.tipo === 'editar'} onClose={cerrar} title="Editar solicitud" size="lg">
        {dialogo?.tipo === 'editar' && (
          <ServicioForm servicio={dialogo.servicio} modo="cliente" clienteId={usuario.idUsuario} onSuccess={cerrar} onCancel={cerrar} />
        )}
      </Modal>

      <Modal open={dialogo?.tipo === 'calificar'} onClose={cerrar} title="Calificar servicio">
        {dialogo?.tipo === 'calificar' && <CalificacionForm servicio={dialogo.servicio} onSuccess={cerrar} onCancel={cerrar} />}
      </Modal>

      <Modal open={dialogo?.tipo === 'pago'} onClose={cerrar} title="Registrar pago" description="Adjunta el comprobante del pago que hiciste al técnico.">
        {dialogo?.tipo === 'pago' && <EvidenciaPagoForm servicio={dialogo.servicio} onSuccess={cerrar} onCancel={cerrar} />}
      </Modal>

      <ConfirmDialog
        open={dialogo?.tipo === 'cancelar'}
        title="Cancelar solicitud"
        message={dialogo?.tipo === 'cancelar' && <>¿Seguro que deseas cancelar “{dialogo.servicio.titulo}”?</>}
        confirmLabel="Cancelar solicitud"
        loading={cancelando}
        onConfirm={cancelar}
        onClose={cerrar}
      />
    </>
  )
}
