import { aniosDesde, hoyISO, parseFecha } from '@/shared/lib'

export interface ExperienciaLaboral {
  idExperiencia: number
  tecnicoId: number
  tecnicoNombre: string
  empresa: string
  cargo: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string | null
  actualidad: boolean
}

/** Si actualidad es true no debe enviarse fechaFin; si es false, es obligatoria. */
export interface ExperienciaLaboralRequest {
  tecnicoId: number
  empresa: string
  cargo: string
  descripcion: string | null
  fechaInicio: string
  fechaFin: string | null
  actualidad: boolean
}

/** Años de experiencia contados desde el primer trabajo registrado. */
export function aniosDeExperiencia(experiencias: ExperienciaLaboral[]): number {
  if (experiencias.length === 0) return 0
  const primera = experiencias.map((e) => e.fechaInicio).sort()[0]
  return aniosDesde(primera)
}

/** "4 años 10 meses" entre el inicio y el fin (o hoy, si es el trabajo actual). */
export function duracionTexto(experiencia: Pick<ExperienciaLaboral, 'fechaInicio' | 'fechaFin'>): string {
  const inicio = parseFecha(experiencia.fechaInicio)
  const fin = parseFecha(experiencia.fechaFin ?? hoyISO())
  const meses = Math.max(0, (fin.getFullYear() - inicio.getFullYear()) * 12 + fin.getMonth() - inicio.getMonth())
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  const partes = []
  if (anios) partes.push(`${anios} ${anios === 1 ? 'año' : 'años'}`)
  if (resto) partes.push(`${resto} ${resto === 1 ? 'mes' : 'meses'}`)
  return partes.join(' ') || 'Menos de un mes'
}

/** Trabajo actual primero; luego del más reciente al más antiguo. */
export function ordenarExperiencias(a: ExperienciaLaboral, b: ExperienciaLaboral): number {
  if (a.actualidad !== b.actualidad) return a.actualidad ? -1 : 1
  return b.fechaInicio.localeCompare(a.fechaInicio)
}
