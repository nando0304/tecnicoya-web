import '@fontsource-variable/inter'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from '@/app/App'
import { iniciarReporteDeErrores, reportarError } from '@/shared/lib/reportar-errores'

// Rastreo de errores: los errores de JavaScript del navegador se envían a la API
iniciarReporteDeErrores()

createRoot(document.getElementById('root')!, {
  // Errores al dibujar un componente de React; se siguen mostrando en la consola como siempre
  onUncaughtError: (error) => {
    console.error(error)
    reportarError(error, 'react')
  },
  onCaughtError: (error) => {
    console.error(error)
    reportarError(error, 'react')
  },
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
