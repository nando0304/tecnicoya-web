import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { usePlanes } from '@/entities/plan'
import {
  EstadoSuscripcion,
  useCreateSuscripcion,
  useUpdateSuscripcion,
  type Suscripcion,
  type SuscripcionRequest,
} from '@/entities/suscripcion'
import { useOpcionesTecnico } from '@/entities/tecnico'
import { hoyISO, sumarMeses } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, FormActions, FormGrid, SelectField, TextField } from '@/shared/ui'

const esquema = z
  .object({
    tecnicoId: v.seleccion('Selecciona el técnico'),
    planId: v.seleccion('Selecciona el plan'),
    fechaInicio: z.string().min(1, 'Indica la fecha de inicio'),
    fechaFin: z.string().min(1, 'Indica la fecha de fin'),
    fechaCancelacion: z.string(),
    estadoSuscripcion: z.enum(EstadoSuscripcion.values),
  })
  .refine((f) => !f.fechaInicio || !f.fechaFin || f.fechaFin > f.fechaInicio, {
    path: ['fechaFin'],
    message: 'Debe ser posterior a la fecha de inicio',
  })

interface SuscripcionFormProps {
  suscripcion?: Suscripcion
  onSuccess: () => void
  onCancel?: () => void
}

export function SuscripcionForm({ suscripcion, onSuccess, onCancel }: SuscripcionFormProps) {
  const crear = useCreateSuscripcion()
  const actualizar = useUpdateSuscripcion()
  const tecnicos = useOpcionesTecnico()
  const planes = usePlanes()

  const opcionesPlan = useMemo(
    () =>
      (planes.data ?? [])
        .filter((p) => p.estado === 'ACTIVO' || p.idPlan === suscripcion?.planId)
        .map((p) => ({ value: p.idPlan, label: p.nombrePlan })),
    [planes.data, suscripcion?.planId],
  )

  const hoy = hoyISO()
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tecnicoId: String(suscripcion?.tecnicoId ?? ''),
      planId: String(suscripcion?.planId ?? ''),
      fechaInicio: suscripcion?.fechaInicio ?? hoy,
      fechaFin: suscripcion?.fechaFin ?? sumarMeses(hoy, 1),
      fechaCancelacion: suscripcion?.fechaCancelacion ?? '',
      estadoSuscripcion: suscripcion?.estadoSuscripcion ?? 'PENDIENTE',
    },
  })
  const estado = useWatch({ control, name: 'estadoSuscripcion' })

  const onSubmit = handleSubmit(async (valores) => {
    const body: SuscripcionRequest = {
      tecnicoId: Number(valores.tecnicoId),
      planId: Number(valores.planId),
      fechaInicio: valores.fechaInicio,
      fechaFin: valores.fechaFin,
      fechaCancelacion: valores.estadoSuscripcion === 'CANCELADA' && valores.fechaCancelacion ? valores.fechaCancelacion : null,
      estadoSuscripcion: valores.estadoSuscripcion,
    }
    const ok = await ejecutar(
      () =>
        suscripcion ? actualizar.mutateAsync({ id: suscripcion.idSuscripcion, body }) : crear.mutateAsync(body),
      { exito: suscripcion ? 'Suscripción actualizada' : 'Suscripción registrada', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        <SelectField
          label="Técnico"
          required
          placeholder={tecnicos.isLoading ? 'Cargando…' : 'Selecciona el técnico'}
          options={tecnicos.opciones}
          error={errors.tecnicoId?.message}
          {...register('tecnicoId')}
        />
        <SelectField
          label="Plan"
          required
          placeholder={planes.isLoading ? 'Cargando…' : 'Selecciona el plan'}
          options={opcionesPlan}
          error={errors.planId?.message}
          {...register('planId')}
        />
        <TextField label="Inicio" type="date" required error={errors.fechaInicio?.message} {...register('fechaInicio')} />
        <TextField label="Fin" type="date" required error={errors.fechaFin?.message} {...register('fechaFin')} />
        <SelectField
          label="Estado"
          required
          options={EstadoSuscripcion.options}
          hint="Solo puede haber una suscripción ACTIVA por técnico"
          error={errors.estadoSuscripcion?.message}
          {...register('estadoSuscripcion')}
        />
        {estado === 'CANCELADA' && (
          <TextField
            label="Fecha de cancelación"
            type="date"
            hint="Vacía: se registra la fecha actual"
            error={errors.fechaCancelacion?.message}
            {...register('fechaCancelacion')}
          />
        )}
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={suscripcion ? 'Guardar cambios' : 'Registrar suscripción'} />
    </form>
  )
}
