import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Usuario, UsuarioRequest } from './model'

export const usuarioApi = createCrudApi<Usuario, UsuarioRequest>('/usuarios')

const hooks = createCrudHooks('usuarios', usuarioApi)
export const useUsuarios = hooks.useList
export const useCreateUsuario = hooks.useCreate
export const useUpdateUsuario = hooks.useUpdate
export const useRemoveUsuario = hooks.useRemove
