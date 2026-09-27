import { defineEnum, type EnumValue } from '@/shared/lib'
import type { EstadoValidacion } from '@/shared/model/enums'

export const TipoEvidencia = defineEnum({
  CERTIFICADO: ['Certificado', 'primary'],
  TITULO_PROFESIONAL: ['Título profesional', 'primary'],
  ANTECEDENTES: ['Antecedentes', 'info'],
  DOCUMENTO_IDENTIDAD: ['Documento de identidad', 'info'],
  FOTO_TRABAJO: ['Foto de trabajo', 'neutral'],
  OTRO: ['Otro', 'neutral'],
})
export type TipoEvidencia = EnumValue<typeof TipoEvidencia>

export interface Evidencia {
  idEvidencia: number
  tecnicoId: number
  tecnicoNombre: string
  tipoEvidencia: TipoEvidencia
  urlArchivo: string
  descripcion: string | null
  estadoValidacion: EstadoValidacion
  fechaCarga: string
}

/** estadoValidacion en null conserva el actual (y al crear queda PENDIENTE). */
export interface EvidenciaRequest {
  tecnicoId: number
  tipoEvidencia: TipoEvidencia
  urlArchivo: string
  descripcion: string | null
  estadoValidacion?: EstadoValidacion | null
}

export function toEvidenciaRequest(evidencia: Evidencia, cambios: Partial<EvidenciaRequest> = {}): EvidenciaRequest {
  return {
    tecnicoId: evidencia.tecnicoId,
    tipoEvidencia: evidencia.tipoEvidencia,
    urlArchivo: evidencia.urlArchivo,
    descripcion: evidencia.descripcion,
    estadoValidacion: evidencia.estadoValidacion,
    ...cambios,
  }
}
