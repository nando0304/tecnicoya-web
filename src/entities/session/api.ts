import type { Usuario } from '@/entities/usuario'
import { http } from '@/shared/api'

export interface Credenciales {
  correo: string
  contrasena: string
}

/** Respuesta del login: el token JWT que se envía en las demás peticiones y el usuario. */
export interface Sesion {
  token: string
  usuario: Usuario
}

/** POST /api/auth/login: devuelve el token y el usuario, o 401 si las credenciales no son válidas. */
export const login = (credenciales: Credenciales) => http.post<Sesion>('/auth/login', credenciales)
