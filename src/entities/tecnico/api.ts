import { useMemo } from 'react'
import { createCrudApi, createCrudHooks } from '@/shared/api'
import type { Tecnico, TecnicoRequest } from './model'

export const tecnicoApi = createCrudApi<Tecnico, TecnicoRequest>('/tecnicos')

const hooks = createCrudHooks('tecnicos', tecnicoApi)
export const useTecnicos = hooks.useList
export const useCreateTecnico = hooks.useCreate
export const useUpdateTecnico = hooks.useUpdate
export const useRemoveTecnico = hooks.useRemove

/** Perfil de técnico de un usuario (la API no tiene filtro por usuario: se busca en la lista). */
export function useTecnicoDeUsuario(usuarioId: number) {
  const query = useTecnicos()
  return { ...query, tecnico: query.data?.find((t) => t.usuarioId === usuarioId) }
}

/** Opciones para un <select> de técnicos. */
export function useOpcionesTecnico(enabled = true) {
  const { data, isLoading } = useTecnicos({ enabled })
  const opciones = useMemo(
    () => (data ?? []).map((t) => ({ value: t.idTecnico, label: `${t.nombreCompleto} · ${t.especialidad}` })),
    [data],
  )
  return { opciones, isLoading }
}
