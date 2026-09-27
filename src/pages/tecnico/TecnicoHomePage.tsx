import { Link } from '@tanstack/react-router'
import { ArrowRight, Briefcase, CalendarClock, CheckCircle2, CreditCard, Megaphone, Star } from 'lucide-react'
import { useMemo } from 'react'
import { resumirCalificaciones, useCalificaciones } from '@/entities/calificacion'
import { useServicios } from '@/entities/servicio'
import { useUsuarioActual } from '@/entities/session'
import { useSuscripciones } from '@/entities/suscripcion'
import type { Tecnico } from '@/entities/tecnico'
import { formatFecha } from '@/shared/lib'
import { EmptyState, LoadingState, PageHeader, Panel, StatCard } from '@/shared/ui'
import { ServicioCard } from '@/widgets/servicio-card'
import { TecnicoGate, VerificacionAviso } from '@/widgets/tecnico-gate'
import { ResenasLista } from '@/widgets/tecnico-perfil'

export function TecnicoHomePage() {
  return <TecnicoGate>{(tecnico) => <Inicio tecnico={tecnico} />}</TecnicoGate>
}

function Inicio({ tecnico }: { tecnico: Tecnico }) {
  const usuario = useUsuarioActual()
  const servicios = useServicios()
  const calificaciones = useCalificaciones()
  const suscripciones = useSuscripciones()

  const datos = useMemo(() => {
    const todos = servicios.data ?? []
    const mios = todos.filter((s) => s.tecnicoId === tecnico.idTecnico)
    return {
      activos: mios
        .filter((s) => s.estadoServicio === 'ASIGNADO' || s.estadoServicio === 'EN_PROCESO')
        .sort((a, b) => (a.fechaServicio ?? '9999').localeCompare(b.fechaServicio ?? '9999')),
      finalizados: mios.filter((s) => s.estadoServicio === 'FINALIZADO').length,
      disponibles: todos.filter((s) => s.estadoServicio === 'PENDIENTE' && s.tecnicoId === null).length,
      resumen: resumirCalificaciones(calificaciones.data?.filter((c) => c.tecnicoId === tecnico.idTecnico) ?? []),
      plan: suscripciones.data?.find((s) => s.tecnicoId === tecnico.idTecnico && s.estadoSuscripcion === 'ACTIVA'),
    }
  }, [servicios.data, calificaciones.data, suscripciones.data, tecnico.idTecnico])

  return (
    <>
      <PageHeader
        title={`Hola, ${usuario.nombres.split(' ')[0]}`}
        description="Este es el resumen de tu actividad en TécnicoYa."
        actions={
          <Link to="/tecnico/servicios" className="btn btn-primary shadow-md shadow-primary/25">
            <Briefcase className="size-4" /> Mis servicios
          </Link>
        }
      />

      <VerificacionAviso tecnico={tecnico} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Servicios activos" value={datos.activos.length} icon={CalendarClock} tone="info" hint="Asignados o en proceso" />
        <StatCard label="Servicios finalizados" value={datos.finalizados} icon={CheckCircle2} tone="success" />
        <StatCard
          label="Calificación promedio"
          value={datos.resumen.total ? datos.resumen.promedio.toFixed(1) : '—'}
          icon={Star}
          tone="warning"
          hint={datos.resumen.total ? `${datos.resumen.total} ${datos.resumen.total === 1 ? 'reseña' : 'reseñas'} · ${datos.resumen.satisfechos}% satisfechos` : 'Aún sin reseñas'}
        />
        <StatCard
          label="Plan actual"
          value={datos.plan?.nombrePlan ?? 'Sin plan'}
          icon={CreditCard}
          hint={datos.plan ? `Vigente hasta el ${formatFecha(datos.plan.fechaFin)}` : 'Elige un plan para recibir clientes'}
        />
      </div>

      {tecnico.estadoVerificacion === 'VERIFICADO' && datos.disponibles > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-box bg-linear-to-r from-primary to-primary-strong p-5 text-primary-content shadow-lg shadow-primary/20 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/15">
            <Megaphone className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold">
              {datos.disponibles === 1 ? 'Hay 1 solicitud esperando técnico' : `Hay ${datos.disponibles} solicitudes esperando técnico`}
            </p>
            <p className="text-sm text-white/80">Acéptalas antes que otros técnicos para sumar clientes.</p>
          </div>
          <Link to="/tecnico/servicios" className="btn border-0 bg-white text-primary hover:bg-white/90">
            Ver solicitudes <ArrowRight className="size-4" />
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <Panel
          title="Próximos servicios"
          actions={
            <Link to="/tecnico/servicios" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          }
        >
          {servicios.isLoading ? (
            <LoadingState />
          ) : datos.activos.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No tienes servicios activos" description="Cuando aceptes una solicitud, aparecerá aquí." />
          ) : (
            <div className="space-y-4">
              {datos.activos.slice(0, 3).map((s) => (
                <ServicioCard key={s.idServicio} servicio={s} perspectiva="tecnico" />
              ))}
            </div>
          )}
        </Panel>
        <ResenasLista tecnicoId={tecnico.idTecnico} limite={3} titulo="Últimas reseñas" />
      </div>
    </>
  )
}
