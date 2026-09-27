import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from './http'

export interface CrudApi<Res, Req> {
  list: () => Promise<Res[]>
  get: (id: number) => Promise<Res>
  create: (body: Req) => Promise<Res>
  update: (id: number, body: Req) => Promise<Res>
  remove: (id: number) => Promise<void>
}

/** Todos los recursos de la API exponen el mismo CRUD: GET /, GET /{id}, POST /, PUT /{id}, DELETE /{id}. */
export function createCrudApi<Res, Req>(path: string): CrudApi<Res, Req> {
  return {
    list: () => http.get<Res[]>(path),
    get: (id) => http.get<Res>(`${path}/${id}`),
    create: (body) => http.post<Res>(path, body),
    update: (id, body) => http.put<Res>(`${path}/${id}`, body),
    remove: (id) => http.delete(`${path}/${id}`),
  }
}

/**
 * Hooks de TanStack Query para un recurso CRUD.
 * Tras cualquier cambio se invalidan todas las consultas: las respuestas incluyen
 * datos de otros recursos (p. ej. el nombre del técnico en un servicio).
 */
export function createCrudHooks<Res, Req>(key: string, api: CrudApi<Res, Req>) {
  return {
    useList: (options: { enabled?: boolean } = {}) =>
      useQuery({ queryKey: [key], queryFn: api.list, ...options }),

    useCreate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: api.create,
        onSuccess: () => queryClient.invalidateQueries(),
      })
    },

    useUpdate: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: ({ id, body }: { id: number; body: Req }) => api.update(id, body),
        onSuccess: () => queryClient.invalidateQueries(),
      })
    },

    useRemove: () => {
      const queryClient = useQueryClient()
      return useMutation({
        mutationFn: api.remove,
        onSuccess: () => queryClient.invalidateQueries(),
      })
    },
  }
}
