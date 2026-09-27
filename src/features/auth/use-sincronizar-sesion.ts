import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSession } from '@/entities/session'
import { EstadoUsuario, usuarioApi, type Usuario } from '@/entities/usuario'
import { ApiError } from '@/shared/api'
import { toast } from '@/shared/ui'
import { useLogout } from './use-logout'

/**
 * La sesión vive en el navegador (la API no emite tokens): al entrar se vuelve a consultar
 * el usuario para reflejar cambios hechos por un administrador, como un bloqueo o una eliminación.
 */
export function useSincronizarSesion(usuario: Usuario) {
  const actualizar = useSession((s) => s.actualizar)
  const logout = useLogout()
  const { data, error } = useQuery({
    queryKey: ['sesion', usuario.idUsuario],
    queryFn: () => usuarioApi.get(usuario.idUsuario),
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    if (error instanceof ApiError && error.status === 404) {
      toast.error('Tu cuenta ya no existe. Inicia sesión con otra cuenta.')
      logout()
    }
  }, [error, logout])

  useEffect(() => {
    if (!data) return
    if (data.estado !== 'ACTIVO') {
      toast.error(`Tu cuenta está ${EstadoUsuario.label(data.estado).toLowerCase()}. Comunícate con el administrador.`)
      logout()
    } else if (JSON.stringify(data) !== JSON.stringify(usuario)) {
      actualizar(data)
    }
  }, [data, usuario, actualizar, logout])
}
