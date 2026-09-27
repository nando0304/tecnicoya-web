import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { PagoSuscripcion, PagoSuscripcionRequest } from './model'

export const pagoSuscripcionApi = createCrudApi<PagoSuscripcion, PagoSuscripcionRequest>('/pagos-suscripcion')

const hooks = createCrudHooks('pagos-suscripcion', pagoSuscripcionApi)
export const usePagosSuscripcion = hooks.useList
export const useCreatePagoSuscripcion = hooks.useCreate
export const useUpdatePagoSuscripcion = hooks.useUpdate
export const useRemovePagoSuscripcion = hooks.useRemove
