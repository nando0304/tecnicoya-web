import { RouterProvider } from '@tanstack/react-router'
import { AppProviders } from './providers/AppProviders'
import { router } from './router/router'
import { NuevosModulosPanel } from '../widgets/NuevosModulosPanel'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <NuevosModulosPanel />
    </AppProviders>
  )
}