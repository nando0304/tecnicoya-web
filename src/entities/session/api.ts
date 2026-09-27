import type { Usuario } from '@/entities/usuario'
import { http } from '@/shared/api'

export interface Credenciales {
  correo: string
  contrasena: string
}

/** POST /api/auth/login: devuelve el usuario o 401 si las credenciales no son válidas. */
export const login = (credenciales: Credenciales) => http.post<Usuario>('/auth/login', credenciales)
