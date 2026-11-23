import { API_URL } from '@/shared/config/env'

/**
 * Rastreo de errores del front-end: envía a la API (POST /api/monitoreo/errores-frontend) los errores de JavaScript
 * que le ocurren al usuario en su navegador. La API los guarda en su log y los cuenta en la métrica
 * tecnicoya_errores_frontend_total, que se ve en Grafana. Ver tecnicoya-api/docs/monitoreo.md.
 */

type TipoError = 'error' | 'promesa' | 'react'

// Evita inundar la API: como máximo 20 reportes por pestaña y nunca dos veces el mismo error
const MAXIMO_POR_SESION = 20
const yaReportados = new Set<string>()

export function reportarError(error: unknown, tipo: TipoError) {
  const e = error instanceof Error ? error : new Error(String(error ?? 'Error desconocido'))
  const clave = `${e.message}|${e.stack?.split('\n')[1] ?? ''}`
  if (yaReportados.size >= MAXIMO_POR_SESION || yaReportados.has(clave)) return
  yaReportados.add(clave)

  const cuerpo = JSON.stringify({
    mensaje: (e.message || 'Error sin mensaje').slice(0, 1000),
    pila: e.stack?.slice(0, 8000),
    // Sin la parte ?consulta de la URL, por si llevara datos personales
    url: (location.origin + location.pathname).slice(0, 1000),
    navegador: navigator.userAgent.slice(0, 500),
    tipo,
  })
  // keepalive: el reporte se envía aunque el usuario recargue o cierre la página
  fetch(`${API_URL}/monitoreo/errores-frontend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo,
    keepalive: true,
  }).catch(() => {
    // Si el reporte falla no se hace nada: nunca debe romper la aplicación
  })
}

/** Escucha los errores que nadie capturó: excepciones y promesas rechazadas. */
export function iniciarReporteDeErrores() {
  window.addEventListener('error', (evento) => reportarError(evento.error ?? evento.message, 'error'))
  window.addEventListener('unhandledrejection', (evento) => reportarError(evento.reason, 'promesa'))
}
