import { redirect } from '@tanstack/react-router'
import { INICIO_POR_ROL, useSession } from '@/entities/session'
import type { TipoUsuario } from '@/entities/usuario'

const usuarioActual = () => useSession.getState().usuario

export function requerirSesion() {
  if (!usuarioActual()) throw redirect({ to: '/login' })
}

export function requerirInvitado() {
  const usuario = usuarioActual()
  if (usuario) throw redirect({ to: INICIO_POR_ROL[usuario.tipoUsuario] })
}

/** Cada rol solo entra a su sección; si intenta otra, vuelve a su inicio. */
export function requerirRol(rol: TipoUsuario) {
  return () => {
    const usuario = usuarioActual()
    if (!usuario) throw redirect({ to: '/login' })
    if (usuario.tipoUsuario !== rol) throw redirect({ to: INICIO_POR_ROL[usuario.tipoUsuario] })
  }
}

export function redirigirAlInicio(): never {
  const usuario = usuarioActual()
  throw redirect({ to: usuario ? INICIO_POR_ROL[usuario.tipoUsuario] : '/login' })
}

/** ?q= del buscador de la barra superior. */
export function validarBusqueda(search: Record<string, unknown>): { q?: string } {
  return typeof search.q === 'string' && search.q.trim() ? { q: search.q.trim() } : {}
}
