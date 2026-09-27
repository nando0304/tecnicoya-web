import { defineEnum, type EnumValue } from '@/shared/lib'
import type { EstadoRegistro } from '@/shared/model/enums'

export const DiaSemana = defineEnum({
  LUNES: ['Lunes', 'neutral'],
  MARTES: ['Martes', 'neutral'],
  MIERCOLES: ['Miércoles', 'neutral'],
  JUEVES: ['Jueves', 'neutral'],
  VIERNES: ['Viernes', 'neutral'],
  SABADO: ['Sábado', 'neutral'],
  DOMINGO: ['Domingo', 'neutral'],
})
export type DiaSemana = EnumValue<typeof DiaSemana>

export interface Disponibilidad {
  idDisponibilidad: number
  tecnicoId: number
  tecnicoNombre: string
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  estado: EstadoRegistro
}

export interface DisponibilidadRequest {
  tecnicoId: number
  diaSemana: DiaSemana
  horaInicio: string
  horaFin: string
  estado?: EstadoRegistro | null
}

/** Ordena por día de la semana y luego por hora de inicio. */
export function ordenarDisponibilidad(a: Disponibilidad, b: Disponibilidad): number {
  const dia = DiaSemana.values.indexOf(a.diaSemana) - DiaSemana.values.indexOf(b.diaSemana)
  return dia !== 0 ? dia : a.horaInicio.localeCompare(b.horaInicio)
}
