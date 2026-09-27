import { CheckCircle2, ClipboardList, Hand, Play, Receipt, Search, Undo2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCalificaciones } from '@/entities/calificacion'
import {
  servicioApi,
  toServicioRequest,
  useServicios,
  useUpdateServicio,
  type Servicio,
  type ServicioRequest,
} from '@/entities/servicio'
import type { Tecnico } from '@/entities/tecnico'
import { EvidenciaPagoForm } from '@/features/evidencia-pago-form'
import { cn, coincide } from '@/shared/lib'
import { useBusquedaInicial } from '@/shared/lib/use-busqueda'
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, PageHeader, Stars, Tabs, ejecutar } from '@/shared/ui'
import { ServicioCard } from '@/widgets/servicio-card'
import { TecnicoGate, VerificacionAviso } from '@/widgets/tecnico-gate'

export function MisServiciosPage() {
  const busqueda = useBusquedaInicial()
  return <TecnicoGate>{(tecnico) => <MisServicios key={busqueda} tecnico={tecnico} busquedaInicial={busqueda} />}</TecnicoGate>
}

type Vista = 'mios' | 'disponibles'
type Filtro = 'activos' | 'finalizados' | 'cancelados' | 'todos'
type Accion = 'aceptar' | 'iniciar' | 'finalizar' | 'liberar'

const FILTROS: { id: Filtro; label: string; incluye: (s: Servicio) => boolean }[] = [
  { id: 'activos', label: 'Activos', incluye: (s) => s.estadoServicio === 'ASIGNADO' || s.estadoServicio === 'EN_PROCESO' },
  { id: 'finalizados', label: 'Finalizados', incluye: (s) => s.estadoServicio === 'FINALIZADO' },
  { id: 'cancelados', label: 'Cancelados', incluye: (s) => s.estadoServicio === 'CANCELADO' },
  { id: 'todos', label: 'Todos', incluye: () => true },
]

/** Próximos primero; los que no tienen fecha, al final. */
const porFechaServicio = (a: Servicio, b: Servicio) =>
  (a.fechaServicio ?? '9999').localeCompare(b.fechaServicio ?? '9999') || b.fechaSolicitud.localeCompare(a.fechaSolicitud)

function MisServicios({ tecnico, busquedaInicial }: { tecnico: Tecnico; busquedaInicial: string }) {
  const { data, isLoading, error, refetch } = useServicios()
  const calificaciones = useCalificaciones()
  const actualizar = useUpdateServicio()

  const [vista, setVista] = useState<Vista>('mios')
  const [filtro, setFiltro] = useState<Filtro>(busquedaInicial ? 'todos' : 'activos')
  const [texto, setTexto] = useState(busquedaInicial)
  const [pendiente, setPendiente] = useState<{ servicio: Servicio; accion: Accion } | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [registrarPago, setRegistrarPago] = useState<Servicio | null>(null)

  const verificado = tecnico.estadoVerificacion === 'VERIFICADO'

  const { mios, disponibles } = useMemo(() => {
    const todos = data ?? []
    return {
      mios: todos.filter((s) => s.tecnicoId === tecnico.idTecnico),
      disponibles: todos.filter((s) => s.estadoServicio === 'PENDIENTE' && s.tecnicoId === null).sort(porFechaServicio),
    }
  }, [data, tecnico.idTecnico])

  const calificacionPorServicio = useMemo(
    () => new Map(calificaciones.data?.map((c) => [c.servicioId, c])),
    [calificaciones.data],
  )

  const incluye = FILTROS.find((f) => f.id === filtro)!.incluye
  const visibles = (vista === 'mios' ? mios.filter(incluye) : disponibles)
    .filter((s) => coincide(`${s.titulo} ${s.clienteNombre} ${s.descripcionProblema}`, texto))
    .sort(filtro === 'activos' || vista === 'disponibles' ? porFechaServicio : (a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))

  const ACCIONES: Record<Accion, { titulo: string; mensaje: string; boton: string; exito: string; cambios: Partial<ServicioRequest>; danger?: boolean }> = {
    aceptar: {
      titulo: 'Aceptar servicio',
      mensaje: 'El servicio quedará asignado a ti y el cliente verá tus datos de contacto.',
      boton: 'Aceptar servicio',
      exito: 'Servicio aceptado. ¡Coordina la visita con el cliente!',
      cambios: { tecnicoId: tecnico.idTecnico, estadoServicio: 'ASIGNADO' },
    },
    iniciar: {
      titulo: 'Iniciar servicio',
      mensaje: 'El cliente verá que el servicio está en proceso.',
      boton: 'Iniciar',
      exito: 'Servicio en proceso',
      cambios: { estadoServicio: 'EN_PROCESO' },
    },
    finalizar: {
      titulo: 'Finalizar servicio',
      mensaje: 'Se registrará la fecha de cierre y el cliente podrá calificar tu trabajo.',
      boton: 'Marcar como finalizado',
      exito: 'Servicio finalizado. ¡Buen trabajo!',
      cambios: { estadoServicio: 'FINALIZADO' },
    },
    liberar: {
      titulo: 'Liberar servicio',
      mensaje: 'Dejarás de estar asignado y el servicio volverá a quedar disponible para otros técnicos.',
      boton: 'Liberar',
      exito: 'Servicio liberado',
      cambios: { tecnicoId: null, estadoServicio: 'PENDIENTE' },
      danger: true,
    },
  }

  const confirmar = async () => {
    if (!pendiente) return
    const { servicio, accion } = pendiente
    setProcesando(true)
    const ok = await ejecutar(
      async () => {
        // Se consulta el estado actual: otro técnico pudo tomarlo o el cliente cancelarlo mientras tanto
        const actual = await servicioApi.get(servicio.idServicio)
        if (accion === 'aceptar' && (actual.tecnicoId !== null || actual.estadoServicio !== 'PENDIENTE')) {
          await refetch()
          throw new Error('Esta solicitud ya no está disponible: otro técnico la aceptó o el cliente la canceló.')
        }
        await actualizar.mutateAsync({ id: actual.idServicio, body: toServicioRequest(actual, ACCIONES[accion].cambios) })
      },
      { exito: ACCIONES[accion].exito },
    )
    setProcesando(false)
    if (ok) {
      setPendiente(null)
      if (accion === 'aceptar') setVista('mios')
    }
  }

  const acciones = (s: Servicio) => {
    if (vista === 'disponibles') {
      return (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!verificado}
          title={verificado ? undefined : 'Tu perfil debe estar verificado'}
          onClick={() => setPendiente({ servicio: s, accion: 'aceptar' })}
        >
          <Hand className="size-4" /> Aceptar servicio
        </button>
      )
    }
    return (
      <>
        {s.estadoServicio === 'ASIGNADO' && (
          <>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setPendiente({ servicio: s, accion: 'iniciar' })}>
              <Play className="size-4" /> Iniciar servicio
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendiente({ servicio: s, accion: 'liberar' })}>
              <Undo2 className="size-4" /> Liberar
            </button>
          </>
        )}
        {s.estadoServicio === 'EN_PROCESO' && (
          <button type="button" className="btn btn-success btn-sm" onClick={() => setPendiente({ servicio: s, accion: 'finalizar' })}>
            <CheckCircle2 className="size-4" /> Marcar como finalizado
          </button>
        )}
        {s.estadoServicio !== 'CANCELADO' && (
          <button type="button" className="btn btn-outline btn-sm border-base-300" onClick={() => setRegistrarPago(s)}>
            <Receipt className="size-4" /> Registrar pago
          </button>
        )}
      </>
    )
  }

  const accionPendiente = pendiente ? ACCIONES[pendiente.accion] : null

  return (
    <>
      <PageHeader title="Mis servicios" description="Atiende tus servicios asignados y acepta nuevas solicitudes de clientes." />
      <VerificacionAviso tecnico={tecnico} />

      <Tabs
        value={vista}
        onChange={setVista}
        className="mb-5"
        tabs={[
          { id: 'mios', label: `Asignados a mí (${mios.length})` },
          { id: 'disponibles', label: `Solicitudes disponibles (${disponibles.length})` },
        ]}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {vista === 'mios' ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
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
                {f.label} ({mios.filter(f.incluye).length})
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Solicitudes de clientes que aún no tienen técnico asignado.</p>
        )}
        <label className="input h-10 w-full border-base-300 bg-base-100 sm:max-w-xs">
          <Search className="size-4 text-muted" aria-hidden />
          <input type="search" className="grow" placeholder="Buscar servicio o cliente…" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar servicio o cliente" />
        </label>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : visibles.length === 0 ? (
        <div className="rounded-box border border-base-300 bg-base-100">
          <EmptyState
            icon={ClipboardList}
            title={vista === 'mios' ? 'No hay servicios en esta lista' : 'No hay solicitudes disponibles'}
            description={vista === 'mios' ? 'Revisa las solicitudes disponibles para conseguir nuevos clientes.' : 'Vuelve más tarde: las nuevas solicitudes aparecerán aquí.'}
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
                perspectiva="tecnico"
                acciones={acciones(s)}
                extra={
                  calificacion && (
                    <div className="mt-4 rounded-lg bg-base-200/70 p-3 text-sm">
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

      <ConfirmDialog
        open={pendiente !== null}
        title={accionPendiente?.titulo ?? ''}
        message={
          pendiente && (
            <>
              <strong className="text-base-content">{pendiente.servicio.titulo}</strong>
              <br />
              {accionPendiente?.mensaje}
            </>
          )
        }
        confirmLabel={accionPendiente?.boton}
        danger={accionPendiente?.danger ?? false}
        loading={procesando}
        onConfirm={confirmar}
        onClose={() => setPendiente(null)}
      />

      <Modal open={registrarPago !== null} onClose={() => setRegistrarPago(null)} title="Registrar pago del servicio">
        {registrarPago && (
          <EvidenciaPagoForm
            servicio={registrarPago}
            onSuccess={() => setRegistrarPago(null)}
            onCancel={() => setRegistrarPago(null)}
          />
        )}
      </Modal>
    </>
  )
}
