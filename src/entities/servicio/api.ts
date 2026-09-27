import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Servicio, ServicioRequest } from './model'

export const servicioApi = createCrudApi<Servicio, ServicioRequest>('/servicios')

const hooks = createCrudHooks('servicios', servicioApi)
export const useServicios = hooks.useList
export const useCreateServicio = hooks.useCreate
export const useUpdateServicio = hooks.useUpdate
export const useRemoveServicio = hooks.useRemove
