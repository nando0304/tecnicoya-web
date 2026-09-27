import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  EstadoPago,
  useCreatePagoSuscripcion,
  useUpdatePagoSuscripcion,
  type PagoSuscripcion,
  type PagoSuscripcionRequest,
} from '@/entities/pago-suscripcion'
import { useSuscripciones } from '@/entities/suscripcion'
import { aInputFechaHora, ahoraInput, formatFecha } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { MetodoPago } from '@/shared/model/enums'
import { ejecutar, FormActions, FormGrid, SelectField, TextField } from '@/shared/ui'

const esquema = z.object({
  suscripcionId: v.seleccion('Selecciona la suscripción'),
  montoPago: v.monto('Ingresa el monto'),
  metodoPago: z.enum(MetodoPago.values),
  estadoPago: z.enum(EstadoPago.values),
  fechaPago: z.string().refine((f) => !f || f <= ahoraInput(), 'No puede ser futura'),
})

interface PagoSuscripcionFormProps {
  pago?: PagoSuscripcion
  onSuccess: () => void
  onCancel?: () => void
}

export function PagoSuscripcionForm({ pago, onSuccess, onCancel }: PagoSuscripcionFormProps) {
  const crear = useCreatePagoSuscripcion()
  const actualizar = useUpdatePagoSuscripcion()
  const suscripciones = useSuscripciones()

  // No se registran pagos de suscripciones canceladas
  const opciones = useMemo(
    () =>
      (suscripciones.data ?? [])
        .filter((s) => s.estadoSuscripcion !== 'CANCELADA' || s.idSuscripcion === pago?.suscripcionId)
        .map((s) => ({
          value: s.idSuscripcion,
          label: `${s.tecnicoNombre} · ${s.nombrePlan} (${formatFecha(s.fechaInicio)} – ${formatFecha(s.fechaFin)})`,
        })),
    [suscripciones.data, pago?.suscripcionId],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      suscripcionId: String(pago?.suscripcionId ?? ''),
      montoPago: pago ? String(pago.montoPago) : '',
      metodoPago: pago?.metodoPago ?? 'TARJETA_CREDITO',
      estadoPago: pago?.estadoPago ?? 'PENDIENTE',
      fechaPago: aInputFechaHora(pago?.fechaPago),
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: PagoSuscripcionRequest = {
      suscripcionId: Number(valores.suscripcionId),
      montoPago: Number(valores.montoPago),
      metodoPago: valores.metodoPago,
      estadoPago: valores.estadoPago,
      fechaPago: valores.fechaPago || null,
    }
    const ok = await ejecutar(
      () => (pago ? actualizar.mutateAsync({ id: pago.idPagoSuscripcion, body }) : crear.mutateAsync(body)),
      { exito: pago ? 'Pago actualizado' : 'Pago registrado', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        <SelectField
          label="Suscripción"
          required
          placeholder={suscripciones.isLoading ? 'Cargando…' : 'Selecciona la suscripción'}
          options={opciones}
          error={errors.suscripcionId?.message}
          className="sm:col-span-2"
          {...register('suscripcionId')}
        />
        <TextField label="Monto (S/)" type="number" inputMode="decimal" step="0.01" min="0.01" required error={errors.montoPago?.message} {...register('montoPago')} />
        <SelectField label="Método de pago" required options={MetodoPago.options} error={errors.metodoPago?.message} {...register('metodoPago')} />
        <SelectField label="Estado" required options={EstadoPago.options} error={errors.estadoPago?.message} {...register('estadoPago')} />
        <TextField
          label="Fecha de pago"
          type="datetime-local"
          max={ahoraInput()}
          hint="Vacía: se registra la fecha actual"
          error={errors.fechaPago?.message}
          {...register('fechaPago')}
        />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={pago ? 'Guardar cambios' : 'Registrar pago'} />
    </form>
  )
}
