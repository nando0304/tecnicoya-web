import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCreateEvidenciaPago,
  useUpdateEvidenciaPago,
  type EvidenciaPago,
  type EvidenciaPagoRequest,
} from '@/entities/evidencia-pago'
import { useServicios } from '@/entities/servicio'
import { aInputFechaHora, ahoraInput } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { EstadoValidacion, MetodoPago } from '@/shared/model/enums'
import { ejecutar, FormActions, FormGrid, SelectField, TextField } from '@/shared/ui'

const esquema = z.object({
  servicioId: v.seleccion('Selecciona el servicio'),
  monto: v.monto('Ingresa el monto'),
  metodoPago: z.enum(MetodoPago.values),
  archivoEvidencia: v.url('Ingresa el enlace del comprobante'),
  fechaPago: z.string().refine((f) => !f || f <= ahoraInput(), 'No puede ser futura'),
  estadoValidacion: z.enum(EstadoValidacion.values),
})

interface EvidenciaPagoFormProps {
  evidencia?: EvidenciaPago
  /** Servicio fijo: se registra el pago desde el propio servicio. */
  servicio?: { idServicio: number; titulo: string }
  puedeValidar?: boolean
  onSuccess: () => void
  onCancel?: () => void
}

export function EvidenciaPagoForm({ evidencia, servicio, puedeValidar = false, onSuccess, onCancel }: EvidenciaPagoFormProps) {
  const crear = useCreateEvidenciaPago()
  const actualizar = useUpdateEvidenciaPago()
  const servicios = useServicios({ enabled: !servicio })

  // La API solo acepta pagos de servicios con técnico y no cancelados
  const opcionesServicio = useMemo(
    () =>
      (servicios.data ?? [])
        .filter((s) => s.idServicio === evidencia?.servicioId || (s.tecnicoId !== null && s.estadoServicio !== 'CANCELADO'))
        .map((s) => ({ value: s.idServicio, label: `#${s.idServicio} · ${s.titulo}` })),
    [servicios.data, evidencia?.servicioId],
  )

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      servicioId: String(evidencia?.servicioId ?? servicio?.idServicio ?? ''),
      monto: evidencia ? String(evidencia.monto) : '',
      metodoPago: evidencia?.metodoPago ?? 'BILLETERA_DIGITAL',
      archivoEvidencia: evidencia?.archivoEvidencia ?? '',
      fechaPago: aInputFechaHora(evidencia?.fechaPago),
      estadoValidacion: evidencia?.estadoValidacion ?? 'PENDIENTE',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: EvidenciaPagoRequest = {
      servicioId: Number(valores.servicioId),
      monto: Number(valores.monto),
      metodoPago: valores.metodoPago,
      archivoEvidencia: valores.archivoEvidencia,
      fechaPago: valores.fechaPago || null,
      estadoValidacion: puedeValidar ? valores.estadoValidacion : evidencia ? 'PENDIENTE' : null,
    }
    const ok = await ejecutar(
      () =>
        evidencia ? actualizar.mutateAsync({ id: evidencia.idEvidenciaPago, body }) : crear.mutateAsync(body),
      { exito: evidencia ? 'Comprobante actualizado' : 'Comprobante registrado', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        {servicio ? (
          <div className="rounded-box bg-base-200 px-4 py-3 text-sm sm:col-span-2">
            <span className="text-muted">Servicio: </span>
            <span className="font-medium">{servicio.titulo}</span>
          </div>
        ) : (
          <SelectField
            label="Servicio"
            required
            placeholder={servicios.isLoading ? 'Cargando…' : 'Selecciona el servicio'}
            options={opcionesServicio}
            error={errors.servicioId?.message}
            className="sm:col-span-2"
            {...register('servicioId')}
          />
        )}
        <TextField label="Monto (S/)" type="number" inputMode="decimal" step="0.01" min="0.01" required error={errors.monto?.message} {...register('monto')} />
        <SelectField label="Método de pago" required options={MetodoPago.options} error={errors.metodoPago?.message} {...register('metodoPago')} />
        <TextField
          label="Enlace del comprobante"
          type="url"
          required
          placeholder="https://…"
          hint="Captura del Yape/Plin, voucher o recibo compartido en la nube"
          error={errors.archivoEvidencia?.message}
          className="sm:col-span-2"
          {...register('archivoEvidencia')}
        />
        <TextField
          label="Fecha de pago"
          type="datetime-local"
          max={ahoraInput()}
          hint="Vacía: se registra la fecha actual"
          error={errors.fechaPago?.message}
          className={puedeValidar ? undefined : 'sm:col-span-2'}
          {...register('fechaPago')}
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
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={evidencia ? 'Guardar cambios' : 'Registrar pago'} />
    </form>
  )
}
