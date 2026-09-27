import { BadgeCheck, ClipboardCheck, Clock, Phone, ShieldX, Star, ThumbsUp, Timer, Wrench, type LucideIcon } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { resumirCalificaciones, useCalificaciones } from '@/entities/calificacion'
import { aniosDeExperiencia, useExperiencias } from '@/entities/experiencia'
import { useServicios } from '@/entities/servicio'
import type { EstadoVerificacion, Tecnico } from '@/entities/tecnico'
import { Avatar, Badge, Panel } from '@/shared/ui'

export function VerificacionBadge({ estado }: { estado: EstadoVerificacion }) {
  if (estado === 'VERIFICADO')
    return (
      <Badge tone="success" icon={<BadgeCheck className="size-3.5" />}>
        Perfil verificado
      </Badge>
    )
  if (estado === 'RECHAZADO')
    return (
      <Badge tone="error" icon={<ShieldX className="size-3.5" />}>
        Verificación rechazada
      </Badge>
    )
  return (
    <Badge tone="warning" icon={<Clock className="size-3.5" />}>
      En revisión
    </Badge>
  )
}

function Chip({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-base-300 px-3.5 py-1.5 text-sm text-muted">
      <Icon className="size-4 text-primary" aria-hidden />
      {children}
    </span>
  )
}

interface PerfilHeaderProps {
  tecnico: Tecnico
  acciones?: ReactNode
}

/** Cabecera del perfil (diseño "Mi perfil como técnico"): identidad, reputación y logros. */
export function PerfilHeader({ tecnico, acciones }: PerfilHeaderProps) {
  const calificaciones = useCalificaciones()
  const servicios = useServicios()
  const experiencias = useExperiencias()

  const { resumen, realizados, anios, conExperiencia } = useMemo(() => {
    const propias = experiencias.data?.filter((e) => e.tecnicoId === tecnico.idTecnico) ?? []
    return {
      resumen: resumirCalificaciones(calificaciones.data?.filter((c) => c.tecnicoId === tecnico.idTecnico) ?? []),
      realizados:
        servicios.data?.filter((s) => s.tecnicoId === tecnico.idTecnico && s.estadoServicio === 'FINALIZADO').length ?? 0,
      anios: aniosDeExperiencia(propias),
      conExperiencia: propias.length > 0,
    }
  }, [calificaciones.data, servicios.data, experiencias.data, tecnico.idTecnico])

  return (
    <Panel>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
        <div className="relative w-fit shrink-0">
          <Avatar nombre={tecnico.nombreCompleto} size="xl" className="ring-4 ring-primary-soft" />
          {tecnico.estadoVerificacion === 'VERIFICADO' && (
            <span
              className="absolute bottom-0.5 right-0.5 grid size-8 place-items-center rounded-full border-[3px] border-base-100 bg-primary text-primary-content"
              title="Perfil verificado"
            >
              <BadgeCheck className="size-4" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{tecnico.nombreCompleto}</h2>
            <VerificacionBadge estado={tecnico.estadoVerificacion} />
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Star className="size-4 fill-accent text-accent" aria-hidden />
              {resumen.total ? (
                <>
                  <strong className="text-base-content">{resumen.promedio.toFixed(1)}</strong>({resumen.total}{' '}
                  {resumen.total === 1 ? 'reseña' : 'reseñas'})
                </>
              ) : (
                'Sin reseñas aún'
              )}
            </span>
            <span className="hidden h-4 w-px bg-base-300 sm:block" aria-hidden />
            <span className="flex items-center gap-1.5">
              <Wrench className="size-4" aria-hidden />
              Técnico en {tecnico.especialidad.toLowerCase()}
            </span>
            {tecnico.telefono && (
              <>
                <span className="hidden h-4 w-px bg-base-300 sm:block" aria-hidden />
                <span className="flex items-center gap-1.5">
                  <Phone className="size-4" aria-hidden />
                  {tecnico.telefono}
                </span>
              </>
            )}
          </div>
        </div>

        {acciones && <div className="flex shrink-0 flex-wrap gap-2 sm:self-start">{acciones}</div>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-base-300 pt-6">
        <Chip icon={Timer}>
          {!conExperiencia ? 'Experiencia por registrar' : anios > 0 ? `${anios}+ años de experiencia` : 'Menos de 1 año de experiencia'}
        </Chip>
        <Chip icon={ClipboardCheck}>
          {realizados} {realizados === 1 ? 'servicio realizado' : 'servicios realizados'}
        </Chip>
        <Chip icon={ThumbsUp}>{resumen.total ? `${resumen.satisfechos}% clientes satisfechos` : 'Aún sin calificaciones'}</Chip>
      </div>
    </Panel>
  )
}
