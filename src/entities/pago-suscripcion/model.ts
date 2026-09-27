import { defineEnum, type EnumValue } from '@/shared/lib'
import type { MetodoPago } from '@/shared/model/enums'

export const EstadoPago = defineEnum({
  PENDIENTE: ['Pendiente', 'warning'],
  APROBADO: ['Aprobado', 'success'],
  RECHAZADO: ['Rechazado', 'error'],
  REEMBOLSADO: ['Reembolsado', 'neutral'],
})
export type EstadoPago = EnumValue<typeof EstadoPago>

export interface PagoSuscripcion {
  idPagoSuscripcion: number
  suscripcionId: number
  tecnicoId: number
  nombrePlan: string
  montoPago: number
  metodoPago: MetodoPago
  estadoPago: EstadoPago
  fechaPago: string
}

/** Sin fechaPago se registra la fecha actual. No se aceptan suscripciones CANCELADAS. */
export interface PagoSuscripcionRequest {
  suscripcionId: number
  montoPago: number
  metodoPago: MetodoPago
  estadoPago?: EstadoPago | null
  fechaPago: string | null
}

export function toPagoSuscripcionRequest(
  pago: PagoSuscripcion,
  cambios: Partial<PagoSuscripcionRequest> = {},
): PagoSuscripcionRequest {
  return {
    suscripcionId: pago.suscripcionId,
    montoPago: pago.montoPago,
    metodoPago: pago.metodoPago,
    estadoPago: pago.estadoPago,
    fechaPago: pago.fechaPago,
    ...cambios,
  }
}
