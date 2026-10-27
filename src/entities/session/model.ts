import { create } from 'zustand'
import type { TipoUsuario, Usuario } from '@/entities/usuario'
import { configurarToken } from '@/shared/api'
import type { Sesion } from './api'

const CLAVE = 'tecnicoya.sesion'

/** El navegador puede bloquear el almacenamiento (modo privado estricto): nunca debe romper la app. */
function almacen(recordar: boolean): Storage | null {
  try {
    return recordar ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function leer(recordar: boolean): Sesion | null {
  try {
    const guardado = almacen(recordar)?.getItem(CLAVE)
    const sesion = guardado ? (JSON.parse(guardado) as Partial<Sesion>) : null
    // Las sesiones guardadas antes de usar tokens solo tienen el usuario: se pide iniciar sesión otra vez
    return sesion?.token && sesion.usuario ? (sesion as Sesion) : null
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

function guardar(sesion: Sesion, recordar: boolean) {
  borrar()
  try {
    almacen(recordar)?.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    /* la sesión dura solo mientras la pestaña esté abierta */
  }
}

interface SessionState {
  usuario: Usuario | null
  /** Token JWT que la API exige en la cabecera Authorization de cada petición. */
  token: string | null
  /** true: la sesión sobrevive al cerrar el navegador (localStorage). */
  recordar: boolean
  iniciar: (sesion: Sesion, recordar: boolean) => void
  actualizar: (usuario: Usuario) => void
  cerrar: () => void
}

const recordada = leer(true)
const inicial = recordada ?? leer(false)

export const useSession = create<SessionState>((set, get) => ({
  usuario: inicial?.usuario ?? null,
  token: inicial?.token ?? null,
  recordar: recordada !== null,
  iniciar: ({ token, usuario }, recordar) => {
    guardar({ token, usuario }, recordar)
    set({ token, usuario, recordar })
  },
  actualizar: (usuario) => {
    const { token, recordar } = get()
    if (token) guardar({ token, usuario }, recordar)
    set({ usuario })
  },
  cerrar: () => {
    borrar()
    set({ token: null, usuario: null })
  },
}))

// El cliente HTTP lee aquí el token en cada petición
configurarToken(() => useSession.getState().token)

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
