import type { EstadoValidacion, MetodoPago } from '@/shared/model/enums'

/** Comprobante del pago de un servicio (cliente → técnico). */
export interface EvidenciaPago {
  idEvidenciaPago: number
  servicioId: number
  servicioTitulo: string
  monto: number
  metodoPago: MetodoPago
  archivoEvidencia: string
  fechaPago: string
  estadoValidacion: EstadoValidacion
}

/** Sin fechaPago se registra la fecha actual. No se aceptan servicios CANCELADOS ni sin técnico. */
export interface EvidenciaPagoRequest {
  servicioId: number
  monto: number
  metodoPago: MetodoPago
  archivoEvidencia: string
  fechaPago: string | null
  estadoValidacion?: EstadoValidacion | null
}

export function toEvidenciaPagoRequest(
  evidencia: EvidenciaPago,
  cambios: Partial<EvidenciaPagoRequest> = {},
): EvidenciaPagoRequest {
  return {
    servicioId: evidencia.servicioId,
    monto: evidencia.monto,
    metodoPago: evidencia.metodoPago,
    archivoEvidencia: evidencia.archivoEvidencia,
    fechaPago: evidencia.fechaPago,
    estadoValidacion: evidencia.estadoValidacion,
    ...cambios,
  }
}
