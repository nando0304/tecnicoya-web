import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  DiaSemana,
  useCreateDisponibilidad,
  useUpdateDisponibilidad,
  type Disponibilidad,
  type DisponibilidadRequest,
} from '@/entities/disponibilidad'
import { useOpcionesTecnico } from '@/entities/tecnico'
import { aInputHora } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { EstadoRegistro } from '@/shared/model/enums'
import { ejecutar, FormActions, FormGrid, SelectField, TextField } from '@/shared/ui'

const esquema = z
  .object({
    tecnicoId: v.seleccion('Selecciona el técnico'),
    diaSemana: z.enum(DiaSemana.values),
    horaInicio: z.string().min(1, 'Indica la hora de inicio'),
    horaFin: z.string().min(1, 'Indica la hora de fin'),
    estado: z.enum(EstadoRegistro.values),
  })
  .refine((f) => !f.horaInicio || !f.horaFin || f.horaFin > f.horaInicio, {
    path: ['horaFin'],
    message: 'Debe ser posterior a la hora de inicio',
  })

interface DisponibilidadFormProps {
  disponibilidad?: Disponibilidad
  /** Técnico fijo (el propio técnico gestionando su horario). */
  tecnicoId?: number
  onSuccess: () => void
  onCancel?: () => void
}

export function DisponibilidadForm({ disponibilidad, tecnicoId, onSuccess, onCancel }: DisponibilidadFormProps) {
  const crear = useCreateDisponibilidad()
  const actualizar = useUpdateDisponibilidad()
  const tecnicos = useOpcionesTecnico(tecnicoId === undefined)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tecnicoId: String(disponibilidad?.tecnicoId ?? tecnicoId ?? ''),
      diaSemana: disponibilidad?.diaSemana ?? 'LUNES',
      horaInicio: aInputHora(disponibilidad?.horaInicio) || '08:00',
      horaFin: aInputHora(disponibilidad?.horaFin) || '13:00',
      estado: disponibilidad?.estado ?? 'ACTIVO',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: DisponibilidadRequest = { ...valores, tecnicoId: Number(valores.tecnicoId) }
    const ok = await ejecutar(
      () =>
        disponibilidad
          ? actualizar.mutateAsync({ id: disponibilidad.idDisponibilidad, body })
          : crear.mutateAsync(body),
      { exito: disponibilidad ? 'Horario actualizado' : 'Horario agregado', setError },
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
        <SelectField label="Día" required options={DiaSemana.options} error={errors.diaSemana?.message} {...register('diaSemana')} />
        <SelectField label="Estado" required options={EstadoRegistro.options} error={errors.estado?.message} {...register('estado')} />
        <TextField label="Desde" type="time" required error={errors.horaInicio?.message} {...register('horaInicio')} />
        <TextField label="Hasta" type="time" required error={errors.horaFin?.message} {...register('horaFin')} />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={disponibilidad ? 'Guardar cambios' : 'Agregar horario'} />
    </form>
  )
}
