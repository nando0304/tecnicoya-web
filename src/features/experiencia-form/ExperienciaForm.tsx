import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  useCreateExperiencia,
  useUpdateExperiencia,
  type ExperienciaLaboral,
  type ExperienciaLaboralRequest,
} from '@/entities/experiencia'
import { useOpcionesTecnico } from '@/entities/tecnico'
import { hoyISO, textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { CheckboxField, ejecutar, FormActions, FormGrid, SelectField, TextAreaField, TextField } from '@/shared/ui'

const esquema = z
  .object({
    tecnicoId: v.seleccion('Selecciona el técnico'),
    empresa: v.texto('Ingresa la empresa', 150),
    cargo: v.texto('Ingresa el cargo', 100),
    descripcion: v.textoLibre(1000),
    fechaInicio: z.string().min(1, 'Indica la fecha de inicio'),
    fechaFin: z.string(),
    actualidad: z.boolean(),
  })
  .superRefine((f, ctx) => {
    const hoy = hoyISO()
    if (f.fechaInicio > hoy) ctx.addIssue({ code: 'custom', path: ['fechaInicio'], message: 'No puede ser futura' })
    if (f.actualidad) return
    if (!f.fechaFin) ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'Indica la fecha de fin' })
    else if (f.fechaFin > hoy) ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'No puede ser futura' })
    else if (f.fechaFin < f.fechaInicio)
      ctx.addIssue({ code: 'custom', path: ['fechaFin'], message: 'No puede ser anterior al inicio' })
  })

interface ExperienciaFormProps {
  experiencia?: ExperienciaLaboral
  tecnicoId?: number
  onSuccess: () => void
  onCancel?: () => void
}

export function ExperienciaForm({ experiencia, tecnicoId, onSuccess, onCancel }: ExperienciaFormProps) {
  const crear = useCreateExperiencia()
  const actualizar = useUpdateExperiencia()
  const tecnicos = useOpcionesTecnico(tecnicoId === undefined)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tecnicoId: String(experiencia?.tecnicoId ?? tecnicoId ?? ''),
      empresa: experiencia?.empresa ?? '',
      cargo: experiencia?.cargo ?? '',
      descripcion: experiencia?.descripcion ?? '',
      fechaInicio: experiencia?.fechaInicio ?? '',
      fechaFin: experiencia?.fechaFin ?? '',
      actualidad: experiencia?.actualidad ?? false,
    },
  })
  const actualidad = useWatch({ control, name: 'actualidad' })

  const onSubmit = handleSubmit(async (valores) => {
    const body: ExperienciaLaboralRequest = {
      tecnicoId: Number(valores.tecnicoId),
      empresa: valores.empresa,
      cargo: valores.cargo,
      descripcion: textoOpcional(valores.descripcion),
      fechaInicio: valores.fechaInicio,
      fechaFin: valores.actualidad ? null : valores.fechaFin,
      actualidad: valores.actualidad,
    }
    const ok = await ejecutar(
      () =>
        experiencia ? actualizar.mutateAsync({ id: experiencia.idExperiencia, body }) : crear.mutateAsync(body),
      { exito: experiencia ? 'Experiencia actualizada' : 'Experiencia agregada', setError },
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
        <TextField label="Empresa" required placeholder="Ej. Trabajador independiente" error={errors.empresa?.message} {...register('empresa')} />
        <TextField label="Cargo" required placeholder="Ej. Electricista" error={errors.cargo?.message} {...register('cargo')} />
        <TextField label="Fecha de inicio" type="date" required max={hoyISO()} error={errors.fechaInicio?.message} {...register('fechaInicio')} />
        {actualidad ? (
          <div className="flex flex-col justify-end">
            <p className="flex h-11 items-center rounded-field bg-primary-soft px-4 text-sm font-medium text-primary">
              Hasta la actualidad
            </p>
          </div>
        ) : (
          <TextField label="Fecha de fin" type="date" required max={hoyISO()} error={errors.fechaFin?.message} {...register('fechaFin')} />
        )}
        <CheckboxField label="Trabajo aquí actualmente" className="sm:col-span-2" {...register('actualidad')} />
        <TextAreaField
          label="Descripción"
          rows={3}
          placeholder="Funciones principales y logros"
          error={errors.descripcion?.message}
          className="sm:col-span-2"
          {...register('descripcion')}
        />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={experiencia ? 'Guardar cambios' : 'Agregar experiencia'} />
    </form>
  )
}
