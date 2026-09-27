import { defineEnum, type EnumValue } from '@/shared/lib'

/** Enums que comparten varios recursos de la API. */

export const EstadoRegistro = defineEnum({
  ACTIVO: ['Activo', 'success'],
  INACTIVO: ['Inactivo', 'neutral'],
})
export type EstadoRegistro = EnumValue<typeof EstadoRegistro>

export const EstadoValidacion = defineEnum({
  PENDIENTE: ['Pendiente', 'warning'],
  APROBADO: ['Aprobado', 'success'],
  RECHAZADO: ['Rechazado', 'error'],
})
export type EstadoValidacion = EnumValue<typeof EstadoValidacion>

export const MetodoPago = defineEnum({
  EFECTIVO: ['Efectivo', 'neutral'],
  TARJETA_CREDITO: ['Tarjeta de crédito', 'neutral'],
  TARJETA_DEBITO: ['Tarjeta de débito', 'neutral'],
  TRANSFERENCIA: ['Transferencia', 'neutral'],
  BILLETERA_DIGITAL: ['Billetera digital', 'neutral'],
})
export type MetodoPago = EnumValue<typeof MetodoPago>
