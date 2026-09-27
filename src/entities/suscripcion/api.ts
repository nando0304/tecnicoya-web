import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Suscripcion, SuscripcionRequest } from './model'

export const suscripcionApi = createCrudApi<Suscripcion, SuscripcionRequest>('/suscripciones')

const hooks = createCrudHooks('suscripciones', suscripcionApi)
export const useSuscripciones = hooks.useList
export const useCreateSuscripcion = hooks.useCreate
export const useUpdateSuscripcion = hooks.useUpdate
export const useRemoveSuscripcion = hooks.useRemove
