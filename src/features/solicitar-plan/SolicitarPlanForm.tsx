import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { pagoSuscripcionApi } from '@/entities/pago-suscripcion'
import type { PlanSuscripcion } from '@/entities/plan'
import { suscripcionApi, type Suscripcion } from '@/entities/suscripcion'
import { formatFecha, formatMoneda, hoyISO, parseFecha, sumarMeses } from '@/shared/lib'
import { MetodoPago } from '@/shared/model/enums'
import { ejecutar, FormActions, SelectField } from '@/shared/ui'

const esquema = z.object({ metodoPago: z.enum(MetodoPago.values) })

interface SolicitarPlanFormProps {
  plan: PlanSuscripcion
  tecnicoId: number
  /** Si hay una suscripción activa, la nueva empieza al día siguiente de que termine. */
  activa?: Suscripcion
  onSuccess: () => void
  onCancel: () => void
}

/**
 * Solicitud de plan por parte del técnico: crea la suscripción PENDIENTE y, si el plan
 * tiene costo, su pago PENDIENTE. El administrador aprueba el pago y activa la suscripción.
 */
export function SolicitarPlanForm({ plan, tecnicoId, activa, onSuccess, onCancel }: SolicitarPlanFormProps) {
  const queryClient = useQueryClient()
  const esGratis = plan.precioInicial === 0

  let fechaInicio = hoyISO()
  if (activa && activa.fechaFin >= fechaInicio) {
    const siguiente = parseFecha(activa.fechaFin)
    siguiente.setDate(siguiente.getDate() + 1)
    fechaInicio = hoyISO(siguiente)
  }
  const fechaFin = sumarMeses(fechaInicio, 1)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { metodoPago: 'TARJETA_CREDITO' as const } })

  const onSubmit = handleSubmit(async ({ metodoPago }) => {
    const ok = await ejecutar(
      async () => {
        const suscripcion = await suscripcionApi.create({
          tecnicoId,
          planId: plan.idPlan,
          fechaInicio,
          fechaFin,
          fechaCancelacion: null,
          estadoSuscripcion: 'PENDIENTE',
        })
        if (!esGratis) {
          await pagoSuscripcionApi.create({
            suscripcionId: suscripcion.idSuscripcion,
            montoPago: plan.precioInicial,
            metodoPago,
            estadoPago: 'PENDIENTE',
            fechaPago: null,
          })
        }
        await queryClient.invalidateQueries()
      },
      { exito: `Solicitaste el plan ${plan.nombrePlan}. Se activará cuando se confirme${esGratis ? '' : ' el pago'}.` },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="rounded-box border border-primary-light bg-primary-soft p-5">
        <p className="text-sm font-medium text-primary">Plan {plan.nombrePlan}</p>
        <p className="mt-1 text-3xl font-bold">
          {esGratis ? 'Gratis' : formatMoneda(plan.precioInicial)}
          {!esGratis && <span className="text-base font-medium text-muted"> / mes</span>}
        </p>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li className="flex gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Hasta {plan.limiteClientes} clientes al mes
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Luego {formatMoneda(plan.precioPosterior)} al mes
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-primary" />
            Vigencia del {formatFecha(fechaInicio)} al {formatFecha(fechaFin)}
          </li>
        </ul>
      </div>

      {!esGratis && <SelectField label="Método de pago" required options={MetodoPago.options} {...register('metodoPago')} />}

      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel="Confirmar solicitud" />
    </form>
  )
}
