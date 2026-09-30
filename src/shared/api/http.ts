import { API_URL } from '@/shared/config/env'
import { ApiError, type ApiErrorBody } from './api-error'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

// La petición ni siquiera salió: el servidor web (Vite) está apagado o no hay red
const SIN_SERVIDOR_WEB = 'No se pudo conectar con el servidor web. Verifica que "npm run dev" esté en ejecución y recarga la página.'
// El servidor web respondió, pero su proxy no alcanzó la API
const SIN_API = 'La API no responde. Verifica que tecnicoya-api esté en ejecución en el puerto 8080.'

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

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

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
