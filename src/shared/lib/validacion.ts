import { z } from 'zod'

/**
 * Reglas de zod equivalentes a las validaciones de los DTO de la API.
 * Los campos numéricos y los selects se manejan como texto en el formulario
 * y se convierten a número al armar el request.
 */

const maximo = (max: number) => `Máximo ${max} caracteres`

export const texto = (mensaje: string, max: number) => z.string().trim().min(1, mensaje).max(max, maximo(max))

export const textoLibre = (max: number) => z.string().trim().max(max, maximo(max))

export const seleccion = (mensaje: string) => z.string().min(1, mensaje)

export const correo = z.string().trim().min(1, 'Ingresa el correo').max(150, maximo(150)).pipe(z.email('Correo no válido'))

export const telefono = z
  .string()
  .trim()
  .regex(/^(\+?[0-9]{7,15})?$/, 'Entre 7 y 15 dígitos, opcionalmente precedido de +')

export const url = (mensaje: string) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .max(500, maximo(500))
    .regex(/^https?:\/\/\S+$/, 'Debe ser un enlace que empiece con http:// o https://')

const FORMATO_MONTO = /^\d{1,8}(\.\d{1,2})?$/

/** Monto mayor que 0 con hasta 8 enteros y 2 decimales. */
export const monto = (mensaje: string) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .regex(FORMATO_MONTO, 'Monto no válido (hasta 2 decimales)')
    .refine((valor) => Number(valor) > 0, 'Debe ser mayor que 0')

/** Precio que admite 0 (planes gratuitos). */
export const precio = (mensaje: string) =>
  z.string().trim().min(1, mensaje).regex(FORMATO_MONTO, 'Precio no válido (hasta 2 decimales)')

export const entero = (mensaje: string, min: number) =>
  z
    .string()
    .trim()
    .min(1, mensaje)
    .regex(/^\d+$/, 'Debe ser un número entero')
    .refine((valor) => Number(valor) >= min, `Debe ser al menos ${min}`)
