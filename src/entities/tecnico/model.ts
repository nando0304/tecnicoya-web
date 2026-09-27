import { defineEnum, type EnumValue } from '@/shared/lib'

export const EstadoVerificacion = defineEnum({
  PENDIENTE: ['Pendiente', 'warning'],
  VERIFICADO: ['Verificado', 'success'],
  RECHAZADO: ['Rechazado', 'error'],
})
export type EstadoVerificacion = EnumValue<typeof EstadoVerificacion>

export interface Tecnico {
  idTecnico: number
  usuarioId: number
  nombreCompleto: string
  correo: string
  telefono: string | null
  especialidad: string
  descripcion: string | null
  estadoVerificacion: EstadoVerificacion
}

export interface TecnicoRequest {
  usuarioId: number
  especialidad: string
  descripcion: string | null
  estadoVerificacion?: EstadoVerificacion | null
}

export function toTecnicoRequest(tecnico: Tecnico, cambios: Partial<TecnicoRequest> = {}): TecnicoRequest {
  return {
    usuarioId: tecnico.usuarioId,
    especialidad: tecnico.especialidad,
    descripcion: tecnico.descripcion,
    estadoVerificacion: tecnico.estadoVerificacion,
    ...cambios,
  }
}
