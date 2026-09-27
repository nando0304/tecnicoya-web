import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { useSession } from '@/entities/session'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const cerrar = useSession((s) => s.cerrar)

  return useCallback(() => {
    cerrar()
    queryClient.clear()
    void navigate({ to: '/login' })
  }, [cerrar, queryClient, navigate])
}
