import { defineEnum, type EnumValue } from '@/shared/lib'

export const EstadoServicio = defineEnum({
  PENDIENTE: ['Pendiente', 'warning'],
  ASIGNADO: ['Asignado', 'info'],
  EN_PROCESO: ['En proceso', 'primary'],
  FINALIZADO: ['Finalizado', 'success'],
  CANCELADO: ['Cancelado', 'error'],
})
export type EstadoServicio = EnumValue<typeof EstadoServicio>

export const Prioridad = defineEnum({
  BAJA: ['Baja', 'neutral'],
  MEDIA: ['Media', 'info'],
  ALTA: ['Alta', 'warning'],
  URGENTE: ['Urgente', 'error'],
})
export type Prioridad = EnumValue<typeof Prioridad>

export interface Servicio {
  idServicio: number
  clienteId: number
  clienteNombre: string
  tecnicoId: number | null
  tecnicoNombre: string | null
  titulo: string
  descripcionProblema: string
  estadoServicio: EstadoServicio
  prioridad: Prioridad
  fechaSolicitud: string
  fechaServicio: string | null
  fechaCierre: string | null
}

/** La fecha de solicitud la asigna la API; la de cierre solo se acepta en FINALIZADO o CANCELADO. */
export interface ServicioRequest {
  clienteId: number
  tecnicoId: number | null
  titulo: string
  descripcionProblema: string
  estadoServicio?: EstadoServicio | null
  prioridad?: Prioridad | null
  fechaServicio: string | null
  fechaCierre: string | null
}

export const estaCerrado = (estado: EstadoServicio) => estado === 'FINALIZADO' || estado === 'CANCELADO'

/**
 * Request para actualizar un servicio a partir de su estado actual.
 * fechaCierre va en null: al cerrar, la API conserva la existente o registra la fecha actual.
 */
export function toServicioRequest(servicio: Servicio, cambios: Partial<ServicioRequest> = {}): ServicioRequest {
  return {
    clienteId: servicio.clienteId,
    tecnicoId: servicio.tecnicoId,
    titulo: servicio.titulo,
    descripcionProblema: servicio.descripcionProblema,
    estadoServicio: servicio.estadoServicio,
    prioridad: servicio.prioridad,
    fechaServicio: servicio.fechaServicio,
    fechaCierre: null,
    ...cambios,
  }
}
