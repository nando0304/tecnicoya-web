import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Calificacion, CalificacionRequest } from './model'

export const calificacionApi = createCrudApi<Calificacion, CalificacionRequest>('/calificaciones')

const hooks = createCrudHooks('calificaciones', calificacionApi)
export const useCalificaciones = hooks.useList
export const useCreateCalificacion = hooks.useCreate
export const useUpdateCalificacion = hooks.useUpdate
export const useRemoveCalificacion = hooks.useRemove
