import { CalendarClock, HardHat, UserRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { EstadoServicio, Prioridad, type Servicio } from '@/entities/servicio'
import { formatFecha, formatFechaHora } from '@/shared/lib'
import { StatusBadge } from '@/shared/ui'

interface ServicioCardProps {
  servicio: Servicio
  /** Quién mira la tarjeta: define si se muestra el cliente o el técnico. */
  perspectiva: 'cliente' | 'tecnico'
  acciones?: ReactNode
  /** Contenido adicional bajo los datos (p. ej. la calificación recibida). */
  extra?: ReactNode
}

export function ServicioCard({ servicio, perspectiva, acciones, extra }: ServicioCardProps) {
  const contraparte =
    perspectiva === 'tecnico'
      ? { icon: UserRound, texto: servicio.clienteNombre }
      : { icon: HardHat, texto: servicio.tecnicoNombre ?? 'Buscando técnico disponible' }

  return (
    <article className="flex flex-col rounded-box border border-base-300 bg-base-100 p-5 shadow-xs transition-colors hover:border-primary/25">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            #{servicio.idServicio} · Solicitado el {formatFecha(servicio.fechaSolicitud)}
          </p>
          <h3 className="mt-1 font-semibold">{servicio.titulo}</h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge def={Prioridad} value={servicio.prioridad} />
          <StatusBadge def={EstadoServicio} value={servicio.estadoServicio} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted">{servicio.descripcionProblema}</p>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <dt className="sr-only">{perspectiva === 'tecnico' ? 'Cliente' : 'Técnico'}</dt>
          <contraparte.icon className="size-4 shrink-0 text-primary" aria-hidden />
          <dd className="truncate">{contraparte.texto}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Fecha del servicio</dt>
          <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden />
          <dd>{servicio.fechaServicio ? formatFechaHora(servicio.fechaServicio) : 'Fecha por coordinar'}</dd>
        </div>
      </dl>

      {extra}

      {acciones && <div className="mt-4 flex flex-wrap gap-2 border-t border-base-300 pt-4">{acciones}</div>}
    </article>
  )
}
