import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { PlanSuscripcion, PlanSuscripcionRequest } from './model'

export const planApi = createCrudApi<PlanSuscripcion, PlanSuscripcionRequest>('/planes-suscripcion')

const hooks = createCrudHooks('planes-suscripcion', planApi)
export const usePlanes = hooks.useList
export const useCreatePlan = hooks.useCreate
export const useUpdatePlan = hooks.useUpdate
export const useRemovePlan = hooks.useRemove
