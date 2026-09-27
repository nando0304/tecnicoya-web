import { Link } from '@tanstack/react-router'
import { BadgeCheck, Star } from 'lucide-react'
import type { ResumenCalificaciones } from '@/entities/calificacion'
import { DiaSemana } from '@/entities/disponibilidad'
import type { Tecnico } from '@/entities/tecnico'
import { cn } from '@/shared/lib'
import { Avatar } from '@/shared/ui'

interface TecnicoCardProps {
  tecnico: Tecnico
  resumen: ResumenCalificaciones
  /** Días con al menos una franja de atención activa. */
  dias: Set<DiaSemana>
  onSolicitar: () => void
}

export function TecnicoCard({ tecnico, resumen, dias, onSolicitar }: TecnicoCardProps) {
  return (
    <article className="flex flex-col rounded-box border border-base-300 bg-base-100 p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Avatar nombre={tecnico.nombreCompleto} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-semibold">{tecnico.nombreCompleto}</h3>
            {tecnico.estadoVerificacion === 'VERIFICADO' && (
              <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Técnico verificado" />
            )}
          </div>
          <p className="text-sm font-medium text-primary">{tecnico.especialidad}</p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" aria-hidden />
            {resumen.total ? (
              <>
                <strong>{resumen.promedio.toFixed(1)}</strong>
                <span className="text-muted">
                  ({resumen.total} {resumen.total === 1 ? 'reseña' : 'reseñas'})
                </span>
              </>
            ) : (
              <span className="text-muted">Nuevo en TécnicoYa</span>
            )}
          </p>
        </div>
      </div>

      {tecnico.descripcion && <p className="mt-4 line-clamp-2 text-sm text-muted">{tecnico.descripcion}</p>}

      <div className="mt-4" aria-label="Días de atención">
        <div className="flex gap-1">
          {DiaSemana.values.map((dia) => (
            <span
              key={dia}
              title={DiaSemana.label(dia)}
              className={cn(
                'grid h-7 flex-1 place-items-center rounded-md text-[11px] font-semibold',
                dias.has(dia) ? 'bg-primary-soft text-primary' : 'bg-base-200 text-muted/50',
              )}
            >
              {DiaSemana.label(dia).slice(0, 2)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          to="/tecnicos/$tecnicoId"
          params={{ tecnicoId: String(tecnico.idTecnico) }}
          className="btn btn-outline btn-sm flex-1 border-base-300"
        >
          Ver perfil
        </Link>
        <button type="button" className="btn btn-primary btn-sm flex-1" onClick={onSolicitar}>
          Solicitar
        </button>
      </div>
    </article>
  )
}
