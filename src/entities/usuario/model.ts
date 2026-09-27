import { defineEnum, type EnumValue } from '@/shared/lib'

export const TipoUsuario = defineEnum({
  CLIENTE: ['Cliente', 'info'],
  TECNICO: ['Técnico', 'primary'],
  ADMINISTRADOR: ['Administrador', 'neutral'],
})
export type TipoUsuario = EnumValue<typeof TipoUsuario>

export const EstadoUsuario = defineEnum({
  ACTIVO: ['Activo', 'success'],
  INACTIVO: ['Inactivo', 'neutral'],
  BLOQUEADO: ['Bloqueado', 'error'],
})
export type EstadoUsuario = EnumValue<typeof EstadoUsuario>

/** UsuarioResponse: nunca incluye la contraseña. */
export interface Usuario {
  idUsuario: number
  nombres: string
  apellidos: string
  correo: string
  telefono: string | null
  tipoUsuario: TipoUsuario
  estado: EstadoUsuario
  fechaRegistro: string
}

/** La contraseña es obligatoria al crear; al actualizar, si se omite se conserva. */
export interface UsuarioRequest {
  nombres: string
  apellidos: string
  correo: string
  contrasena?: string | null
  telefono: string | null
  tipoUsuario: TipoUsuario
  estado?: EstadoUsuario | null
}

export const nombreCompleto = (usuario: Pick<Usuario, 'nombres' | 'apellidos'>) =>
  `${usuario.nombres} ${usuario.apellidos}`

/** Primer nombre y primer apellido: "Carlos Mendoza". */
export const nombreCorto = (usuario: Pick<Usuario, 'nombres' | 'apellidos'>) =>
  `${usuario.nombres.split(' ')[0]} ${usuario.apellidos.split(' ')[0]}`

/** Subtítulo del rol bajo el nombre en la barra superior. */
export const SUBTITULO_ROL: Record<TipoUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  TECNICO: 'Proveedor',
  CLIENTE: 'Cliente',
}

export function toUsuarioRequest(usuario: Usuario, cambios: Partial<UsuarioRequest> = {}): UsuarioRequest {
  return {
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    telefono: usuario.telefono,
    tipoUsuario: usuario.tipoUsuario,
    estado: usuario.estado,
    ...cambios,
  }
}
