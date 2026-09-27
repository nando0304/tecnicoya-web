import { useMemo } from 'react'
import { resumirCalificaciones, useCalificaciones, type ResumenCalificaciones } from '@/entities/calificacion'
import { useDisponibilidades, type DiaSemana } from '@/entities/disponibilidad'
import { useTecnicos, type Tecnico } from '@/entities/tecnico'

export interface EntradaDirectorio {
  tecnico: Tecnico
  resumen: ResumenCalificaciones
  dias: Set<DiaSemana>
}

/** Técnicos verificados con su reputación y días de atención, para que los clientes elijan. */
export function useDirectorioTecnicos() {
  const tecnicos = useTecnicos()
  const calificaciones = useCalificaciones()
  const disponibilidades = useDisponibilidades()

  const directorio = useMemo<EntradaDirectorio[]>(
    () =>
      (tecnicos.data ?? [])
        .filter((t) => t.estadoVerificacion === 'VERIFICADO')
        .map((tecnico) => ({
          tecnico,
          resumen: resumirCalificaciones(calificaciones.data?.filter((c) => c.tecnicoId === tecnico.idTecnico) ?? []),
          dias: new Set(
            disponibilidades.data
              ?.filter((d) => d.tecnicoId === tecnico.idTecnico && d.estado === 'ACTIVO')
              .map((d) => d.diaSemana),
          ),
        })),
    [tecnicos.data, calificaciones.data, disponibilidades.data],
  )

  return { directorio, isLoading: tecnicos.isLoading, error: tecnicos.error, refetch: tecnicos.refetch }
}

/** Mejor calificados primero; a igual promedio, el que tiene más reseñas. */
export const porReputacion = (a: EntradaDirectorio, b: EntradaDirectorio) =>
  b.resumen.promedio - a.resumen.promedio || b.resumen.total - a.resumen.total
