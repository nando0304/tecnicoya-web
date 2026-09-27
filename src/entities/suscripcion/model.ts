import { defineEnum, type EnumValue } from '@/shared/lib'

export const EstadoSuscripcion = defineEnum({
  PENDIENTE: ['Pendiente', 'warning'],
  ACTIVA: ['Activa', 'success'],
  VENCIDA: ['Vencida', 'neutral'],
  CANCELADA: ['Cancelada', 'error'],
})
export type EstadoSuscripcion = EnumValue<typeof EstadoSuscripcion>

export interface Suscripcion {
  idSuscripcion: number
  tecnicoId: number
  tecnicoNombre: string
  planId: number
  nombrePlan: string
  fechaInicio: string
  fechaFin: string
  fechaCancelacion: string | null
  estadoSuscripcion: EstadoSuscripcion
}

/** fechaCancelacion solo se acepta en CANCELADA (si se omite, la API usa la fecha actual). */
export interface SuscripcionRequest {
  tecnicoId: number
  planId: number
  fechaInicio: string
  fechaFin: string
  fechaCancelacion: string | null
  estadoSuscripcion?: EstadoSuscripcion | null
}

export function toSuscripcionRequest(
  suscripcion: Suscripcion,
  cambios: Partial<SuscripcionRequest> = {},
): SuscripcionRequest {
  return {
    tecnicoId: suscripcion.tecnicoId,
    planId: suscripcion.planId,
    fechaInicio: suscripcion.fechaInicio,
    fechaFin: suscripcion.fechaFin,
    fechaCancelacion: suscripcion.estadoSuscripcion === 'CANCELADA' ? suscripcion.fechaCancelacion : null,
    estadoSuscripcion: suscripcion.estadoSuscripcion,
    ...cambios,
  }
}
