/** Cuerpo JSON que devuelve la API en cualquier error (ApiErrorResponse). */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  mensaje: string
  ruta: string
  errores?: Record<string, string>
}

export class ApiError extends Error {
  readonly status: number
  /** Errores de validación por campo, con el nombre del campo del request. */
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'Ocurrió un error inesperado. Inténtalo nuevamente.'
}
