import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { EvidenciaPago, EvidenciaPagoRequest } from './model'

export const evidenciaPagoApi = createCrudApi<EvidenciaPago, EvidenciaPagoRequest>('/evidencias-pago')

const hooks = createCrudHooks('evidencias-pago', evidenciaPagoApi)
export const useEvidenciasPago = hooks.useList
export const useCreateEvidenciaPago = hooks.useCreate
export const useUpdateEvidenciaPago = hooks.useUpdate
export const useRemoveEvidenciaPago = hooks.useRemove
