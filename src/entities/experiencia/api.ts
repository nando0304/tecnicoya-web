import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { ExperienciaLaboral, ExperienciaLaboralRequest } from './model'

export const experienciaApi = createCrudApi<ExperienciaLaboral, ExperienciaLaboralRequest>('/experiencias-laborales')

const hooks = createCrudHooks('experiencias-laborales', experienciaApi)
export const useExperiencias = hooks.useList
export const useCreateExperiencia = hooks.useCreate
export const useUpdateExperiencia = hooks.useUpdate
export const useRemoveExperiencia = hooks.useRemove
