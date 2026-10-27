import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSession } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { toast, Toaster } from '@/shared/ui'
import { router } from '../router/router'

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: cerrarSiVencio }),
  mutationCache: new MutationCache({ onError: cerrarSiVencio }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Los errores 4xx (validación, no encontrado…) no se arreglan reintentando
      retry: (intentos, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && intentos < 1,
    },
    mutations: { retry: false },
  },
})

/** Si la API rechaza el token (401) es porque venció o no es válido: se cierra la sesión y se vuelve al login. */
function cerrarSiVencio(error: Error) {
  const { token, cerrar } = useSession.getState()
  if (!(error instanceof ApiError && error.status === 401) || !token) return
  cerrar()
  queryClient.clear()
  toast.error('Tu sesión expiró. Inicia sesión nuevamente.')
  void router.navigate({ to: '/login' })
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
