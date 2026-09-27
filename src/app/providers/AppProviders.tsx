import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ApiError } from '@/shared/api'
import { Toaster } from '@/shared/ui'

const queryClient = new QueryClient({
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

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
