import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Disponibilidad, DisponibilidadRequest } from './model'

export const disponibilidadApi = createCrudApi<Disponibilidad, DisponibilidadRequest>('/disponibilidades')

const hooks = createCrudHooks('disponibilidades', disponibilidadApi)
export const useDisponibilidades = hooks.useList
export const useCreateDisponibilidad = hooks.useCreate
export const useUpdateDisponibilidad = hooks.useUpdate
export const useRemoveDisponibilidad = hooks.useRemove
