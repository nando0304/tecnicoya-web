import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Evidencia, EvidenciaRequest } from './model'

export const evidenciaApi = createCrudApi<Evidencia, EvidenciaRequest>('/evidencias')

const hooks = createCrudHooks('evidencias', evidenciaApi)
export const useEvidencias = hooks.useList
export const useCreateEvidencia = hooks.useCreate
export const useUpdateEvidencia = hooks.useUpdate
export const useRemoveEvidencia = hooks.useRemove
