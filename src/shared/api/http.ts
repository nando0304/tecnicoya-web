import { API_URL } from '@/shared/config/env'
import { ApiError, type ApiErrorBody } from './api-error'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// La petición ni siquiera salió: el servidor web (Vite) está apagado o no hay red
const SIN_SERVIDOR_WEB = 'No se pudo conectar con el servidor web. Verifica que "npm run dev" esté en ejecución y recarga la página.'
// El servidor web respondió, pero su proxy no alcanzó la API
const SIN_API = 'La API no responde. Verifica que tecnicoya-api esté en ejecución en el puerto 8080.'

let obtenerToken: () => string | null = () => null

/** La sesión indica de dónde leer el token JWT que se envía en cada petición. */
export function configurarToken(obtener: () => string | null) {
  obtenerToken = obtener
}

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = obtenerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, SIN_SERVIDOR_WEB)
  }

  if (response.status === 204) return undefined as T

  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = data as Partial<ApiErrorBody> | null
    // Sin cuerpo JSON: el proxy de Vite no alcanzó la API
    if (!error?.mensaje) {
      throw new ApiError(response.status, response.status >= 500 ? SIN_API : `Error ${response.status}`)
    }
    throw new ApiError(response.status, error.mensaje, error.errores)
  }
  return data as T
}

/** Nombre del archivo indicado por la API en Content-Disposition: attachment; filename="..." */
function nombreArchivo(response: Response, porDefecto: string): string {
  const cabecera = response.headers.get('Content-Disposition') ?? ''
  return /filename="?([^";]+)"?/i.exec(cabecera)?.[1] ?? porDefecto
}

/**
 * Descarga un archivo protegido (p. ej. un reporte Excel). Un enlace <a href> no enviaría el token, así que se
 * pide con fetch, se arma un Blob y se dispara la descarga desde un enlace temporal.
 */
async function descargar(path: string, porDefecto: string): Promise<void> {
  const headers: Record<string, string> = {
    // Si la API responde con error, lo hace en JSON
    Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/json',
  }
  const token = obtenerToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { headers })
  } catch {
    throw new ApiError(0, SIN_SERVIDOR_WEB)
  }
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as Partial<ApiErrorBody> | null
    throw new ApiError(response.status, error?.mensaje ?? (response.status >= 500 ? SIN_API : `Error ${response.status}`))
  }

  const url = URL.createObjectURL(await response.blob())
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo(response, porDefecto)
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
  descargar,
}
