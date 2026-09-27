import { create } from 'zustand'
import type { TipoUsuario, Usuario } from '@/entities/usuario'

const CLAVE = 'tecnicoya.sesion'

/** El navegador puede bloquear el almacenamiento (modo privado estricto): nunca debe romper la app. */
function almacen(recordar: boolean): Storage | null {
  try {
    return recordar ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function leer(recordar: boolean): Usuario | null {
  try {
    const guardado = almacen(recordar)?.getItem(CLAVE)
    return guardado ? (JSON.parse(guardado) as Usuario) : null
  } catch {
    return null
  }
}

function borrar() {
  for (const recordar of [true, false]) {
    try {
      almacen(recordar)?.removeItem(CLAVE)
    } catch {
      /* sin almacenamiento disponible */
    }
  }
}

function guardar(usuario: Usuario, recordar: boolean) {
  borrar()
  try {
    almacen(recordar)?.setItem(CLAVE, JSON.stringify(usuario))
  } catch {
    /* la sesión dura solo mientras la pestaña esté abierta */
  }
}

interface SessionState {
  usuario: Usuario | null
  /** true: la sesión sobrevive al cerrar el navegador (localStorage). */
  recordar: boolean
  iniciar: (usuario: Usuario, recordar: boolean) => void
  actualizar: (usuario: Usuario) => void
  cerrar: () => void
}

const recordada = leer(true)

export const useSession = create<SessionState>((set, get) => ({
  usuario: recordada ?? leer(false),
  recordar: recordada !== null,
  iniciar: (usuario, recordar) => {
    guardar(usuario, recordar)
    set({ usuario, recordar })
  },
  actualizar: (usuario) => {
    guardar(usuario, get().recordar)
    set({ usuario })
  },
  cerrar: () => {
    borrar()
    set({ usuario: null })
  },
}))

/** Usuario de la sesión. Solo para pantallas protegidas: el layout no las renderiza sin sesión. */
export function useUsuarioActual(): Usuario {
  const usuario = useSession((s) => s.usuario)
  if (!usuario) throw new Error('No hay una sesión activa')
  return usuario
}

export const INICIO_POR_ROL = {
  ADMINISTRADOR: '/admin',
  TECNICO: '/tecnico',
  CLIENTE: '/cliente',
} as const satisfies Record<TipoUsuario, string>
