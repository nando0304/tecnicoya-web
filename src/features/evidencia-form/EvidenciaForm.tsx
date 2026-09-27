import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  TipoEvidencia,
  useCreateEvidencia,
  useUpdateEvidencia,
  type Evidencia,
  type EvidenciaRequest,
} from '@/entities/evidencia'
import { useOpcionesTecnico } from '@/entities/tecnico'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { EstadoValidacion } from '@/shared/model/enums'
import { ejecutar, FormActions, FormGrid, SelectField, TextAreaField, TextField } from '@/shared/ui'

const esquema = z.object({
  tecnicoId: v.seleccion('Selecciona el técnico'),
  tipoEvidencia: z.enum(TipoEvidencia.values),
  urlArchivo: v.url('Ingresa el enlace del archivo'),
  descripcion: v.textoLibre(500),
  estadoValidacion: z.enum(EstadoValidacion.values),
})

interface EvidenciaFormProps {
  evidencia?: Evidencia
  tecnicoId?: number
  /** Solo el administrador aprueba o rechaza. */
  puedeValidar?: boolean
  onSuccess: () => void
  onCancel?: () => void
}

export function EvidenciaForm({ evidencia, tecnicoId, puedeValidar = false, onSuccess, onCancel }: EvidenciaFormProps) {
  const crear = useCreateEvidencia()
  const actualizar = useUpdateEvidencia()
  const tecnicos = useOpcionesTecnico(tecnicoId === undefined)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tecnicoId: String(evidencia?.tecnicoId ?? tecnicoId ?? ''),
      tipoEvidencia: evidencia?.tipoEvidencia ?? 'CERTIFICADO',
      urlArchivo: evidencia?.urlArchivo ?? '',
      descripcion: evidencia?.descripcion ?? '',
      estadoValidacion: evidencia?.estadoValidacion ?? 'PENDIENTE',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: EvidenciaRequest = {
      tecnicoId: Number(valores.tecnicoId),
      tipoEvidencia: valores.tipoEvidencia,
      urlArchivo: valores.urlArchivo,
      descripcion: textoOpcional(valores.descripcion),
      // Si el técnico modifica una evidencia, vuelve a revisión
      estadoValidacion: puedeValidar ? valores.estadoValidacion : evidencia ? 'PENDIENTE' : null,
    }
    const ok = await ejecutar(
      () => (evidencia ? actualizar.mutateAsync({ id: evidencia.idEvidencia, body }) : crear.mutateAsync(body)),
      { exito: evidencia ? 'Evidencia actualizada' : 'Evidencia enviada a revisión', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        {tecnicoId === undefined && (
          <SelectField
            label="Técnico"
            required
            placeholder={tecnicos.isLoading ? 'Cargando…' : 'Selecciona el técnico'}
            options={tecnicos.opciones}
            error={errors.tecnicoId?.message}
            className="sm:col-span-2"
            {...register('tecnicoId')}
          />
        )}
        <SelectField
          label="Tipo de evidencia"
          required
          options={TipoEvidencia.options}
          error={errors.tipoEvidencia?.message}
          className={puedeValidar ? undefined : 'sm:col-span-2'}
          {...register('tipoEvidencia')}
        />
        {puedeValidar && (
          <SelectField
            label="Validación"
            required
            options={EstadoValidacion.options}
            error={errors.estadoValidacion?.message}
            {...register('estadoValidacion')}
          />
        )}
        <TextField
          label="Enlace del archivo"
          type="url"
          required
          placeholder="https://drive.google.com/…"
          hint="Sube el documento a tu nube (Drive, OneDrive…) y pega aquí el enlace compartido"
          error={errors.urlArchivo?.message}
          className="sm:col-span-2"
          {...register('urlArchivo')}
        />
        <TextAreaField
          label="Descripción"
          placeholder="Ej. Certificado de electricista industrial - SENATI"
          error={errors.descripcion?.message}
          className="sm:col-span-2"
          {...register('descripcion')}
        />
      </FormGrid>
      {!puedeValidar && evidencia && (
        <p className="mt-4 text-xs text-muted">Al guardar cambios, la evidencia volverá a quedar pendiente de revisión.</p>
      )}
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={evidencia ? 'Guardar cambios' : 'Enviar evidencia'} />
    </form>
  )
}
