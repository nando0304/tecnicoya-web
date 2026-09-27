import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCalificaciones,
  useCreateCalificacion,
  useUpdateCalificacion,
  type Calificacion,
  type CalificacionRequest,
} from '@/entities/calificacion'
import { useServicios } from '@/entities/servicio'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, Field, FormActions, RatingInput, SelectField, TextAreaField } from '@/shared/ui'

const esquema = z.object({
  servicioId: v.seleccion('Selecciona el servicio'),
  puntuacion: z.number().int().min(1, 'Elige una puntuación').max(5),
  comentario: v.textoLibre(500),
})

interface CalificacionFormProps {
  calificacion?: Calificacion
  /** Servicio fijo: el cliente califica un servicio concreto. */
  servicio?: { idServicio: number; titulo: string; tecnicoNombre: string | null }
  onSuccess: () => void
  onCancel?: () => void
}

export function CalificacionForm({ calificacion, servicio, onSuccess, onCancel }: CalificacionFormProps) {
  const crear = useCreateCalificacion()
  const actualizar = useUpdateCalificacion()
  const eligeServicio = !servicio
  const servicios = useServicios({ enabled: eligeServicio })
  const calificaciones = useCalificaciones({ enabled: eligeServicio })

  // Solo servicios FINALIZADOS y sin calificar (más el actual al editar)
  const opcionesServicio = useMemo(() => {
    const calificados = new Set(calificaciones.data?.map((c) => c.servicioId))
    return (servicios.data ?? [])
      .filter(
        (s) =>
          s.idServicio === calificacion?.servicioId ||
          (s.estadoServicio === 'FINALIZADO' && !calificados.has(s.idServicio)),
      )
      .map((s) => ({ value: s.idServicio, label: `#${s.idServicio} · ${s.titulo}` }))
  }, [servicios.data, calificaciones.data, calificacion?.servicioId])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      servicioId: String(calificacion?.servicioId ?? servicio?.idServicio ?? ''),
      puntuacion: calificacion?.puntuacion ?? 0,
      comentario: calificacion?.comentario ?? '',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: CalificacionRequest = {
      servicioId: Number(valores.servicioId),
      puntuacion: valores.puntuacion,
      comentario: textoOpcional(valores.comentario),
    }
    const ok = await ejecutar(
      () =>
        calificacion ? actualizar.mutateAsync({ id: calificacion.idCalificacion, body }) : crear.mutateAsync(body),
      { exito: calificacion ? 'Calificación actualizada' : '¡Gracias por tu calificación!', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {servicio ? (
        <div className="rounded-box bg-base-200 px-4 py-3 text-sm">
          <p className="font-semibold">{servicio.titulo}</p>
          {servicio.tecnicoNombre && <p className="text-muted">Atendido por {servicio.tecnicoNombre}</p>}
        </div>
      ) : (
        <SelectField
          label="Servicio"
          required
          placeholder={servicios.isLoading ? 'Cargando…' : 'Selecciona un servicio finalizado'}
          options={opcionesServicio}
          error={errors.servicioId?.message}
          {...register('servicioId')}
        />
      )}
      <Field label="Puntuación" htmlFor="puntuacion" required error={errors.puntuacion?.message}>
        <Controller
          control={control}
          name="puntuacion"
          render={({ field }) => <RatingInput name={field.name} value={field.value} onChange={field.onChange} />}
        />
      </Field>
      <TextAreaField
        label="Comentario"
        rows={4}
        placeholder="¿Cómo fue la atención? ¿Resolvió el problema?"
        error={errors.comentario?.message}
        {...register('comentario')}
      />
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={calificacion ? 'Guardar cambios' : 'Enviar calificación'} />
    </form>
  )
}
