import { Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, ClipboardList, Plus, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCalificaciones } from '@/entities/calificacion'
import { useServicios, type Servicio } from '@/entities/servicio'
import { useUsuarioActual } from '@/entities/session'
import type { Tecnico } from '@/entities/tecnico'
import { CalificacionForm } from '@/features/calificacion-form'
import { EmptyState, LoadingState, Modal, Panel, SectionHeader, StatCard } from '@/shared/ui'
import { ServicioCard } from '@/widgets/servicio-card'
import { porReputacion, SolicitarServicioModal, TecnicoCard, useDirectorioTecnicos } from '@/widgets/tecnico-card'

export function ClienteHomePage() {
  const usuario = useUsuarioActual()
  const servicios = useServicios()
  const calificaciones = useCalificaciones()
  const { directorio, isLoading: cargandoTecnicos } = useDirectorioTecnicos()

  const [solicitud, setSolicitud] = useState<{ tecnico?: Tecnico } | null>(null)
  const [aCalificar, setACalificar] = useState<Servicio | null>(null)

  const datos = useMemo(() => {
    const mios = (servicios.data ?? []).filter((s) => s.clienteId === usuario.idUsuario)
    const calificados = new Set(calificaciones.data?.map((c) => c.servicioId))
    return {
      activos: mios.filter((s) => ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO'].includes(s.estadoServicio)),
      finalizados: mios.filter((s) => s.estadoServicio === 'FINALIZADO').length,
      porCalificar: mios.filter((s) => s.estadoServicio === 'FINALIZADO' && !calificados.has(s.idServicio)),
    }
  }, [servicios.data, calificaciones.data, usuario.idUsuario])

  const destacados = [...directorio].sort(porReputacion).slice(0, 3)

  return (
    <>
      <section className="relative mb-8 overflow-hidden rounded-box bg-linear-to-br from-primary via-primary-strong to-navy p-6 text-primary-content shadow-lg shadow-primary/20 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <p className="relative text-sm font-medium text-white/80">Hola, {usuario.nombres.split(' ')[0]}</p>
        <h1 className="relative mt-1 max-w-xl text-2xl font-bold tracking-tight sm:text-4xl">¿Qué necesitas reparar hoy?</h1>
        <p className="relative mt-2 max-w-xl text-white/80">Describe el problema y un técnico verificado lo atenderá en tu domicilio.</p>
        <div className="relative mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn border-0 bg-white text-primary hover:bg-white/90" onClick={() => setSolicitud({})}>
            <Plus className="size-4" /> Solicitar servicio
          </button>
          <Link to="/cliente/tecnicos" className="btn border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Search className="size-4" /> Buscar técnicos
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Solicitudes activas" value={datos.activos.length} icon={ClipboardList} tone="info" />
        <StatCard label="Servicios finalizados" value={datos.finalizados} icon={CheckCircle2} tone="success" />
        <StatCard label="Por calificar" value={datos.porCalificar.length} icon={Star} tone="warning" hint="Tu opinión ayuda a otros clientes" />
      </div>

      {datos.porCalificar.length > 0 && (
        <Panel title="Califica tus servicios" description="Cuéntanos cómo te fue con el técnico." className="mt-6">
          <ul className="divide-y divide-base-300">
            {datos.porCalificar.map((s) => (
              <li key={s.idServicio} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{s.titulo}</p>
                  <p className="text-sm text-muted">Atendido por {s.tecnicoNombre}</p>
                </div>
                <button type="button" className="btn btn-sm btn-primary" onClick={() => setACalificar(s)}>
                  <Star className="size-4" /> Calificar
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="mt-8">
        <SectionHeader
          title="Tus solicitudes activas"
          actions={
            <Link to="/cliente/solicitudes" className="btn btn-ghost btn-sm text-primary">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          }
        />
        {servicios.isLoading ? (
          <LoadingState />
        ) : datos.activos.length === 0 ? (
          <div className="rounded-box border border-base-300 bg-base-100">
            <EmptyState
              icon={ClipboardList}
              title="No tienes solicitudes activas"
              action={
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setSolicitud({})}>
                  Solicitar servicio
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {datos.activos.slice(0, 4).map((s) => (
              <ServicioCard key={s.idServicio} servicio={s} perspectiva="cliente" />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <SectionHeader
          title="Técnicos mejor calificados"
          actions={
            <Link to="/cliente/tecnicos" className="btn btn-ghost btn-sm text-primary">
              Ver todos <ArrowRight className="size-4" />
            </Link>
          }
        />
        {cargandoTecnicos ? (
          <LoadingState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {destacados.map(({ tecnico, resumen, dias }) => (
              <TecnicoCard key={tecnico.idTecnico} tecnico={tecnico} resumen={resumen} dias={dias} onSolicitar={() => setSolicitud({ tecnico })} />
            ))}
          </div>
        )}
      </div>

      <SolicitarServicioModal open={solicitud !== null} onClose={() => setSolicitud(null)} tecnico={solicitud?.tecnico} />

      <Modal open={aCalificar !== null} onClose={() => setACalificar(null)} title="Calificar servicio">
        {aCalificar && <CalificacionForm servicio={aCalificar} onSuccess={() => setACalificar(null)} onCancel={() => setACalificar(null)} />}
      </Modal>
    </>
  )
}
