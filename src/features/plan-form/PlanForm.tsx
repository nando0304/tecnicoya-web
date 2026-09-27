import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  useCreatePlan,
  useUpdatePlan,
  type PlanSuscripcion,
  type PlanSuscripcionRequest,
} from '@/entities/plan'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { EstadoRegistro } from '@/shared/model/enums'
import { ejecutar, FormActions, FormGrid, SelectField, TextAreaField, TextField } from '@/shared/ui'

const esquema = z.object({
  nombrePlan: v.texto('Ingresa el nombre del plan', 100),
  precioInicial: v.precio('Ingresa el precio inicial'),
  limiteClientes: v.entero('Ingresa el límite de clientes', 1),
  precioPosterior: v.precio('Ingresa el precio posterior'),
  descripcion: v.textoLibre(500),
  estado: z.enum(EstadoRegistro.values),
})

interface PlanFormProps {
  plan?: PlanSuscripcion
  onSuccess: () => void
  onCancel?: () => void
}

export function PlanForm({ plan, onSuccess, onCancel }: PlanFormProps) {
  const crear = useCreatePlan()
  const actualizar = useUpdatePlan()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombrePlan: plan?.nombrePlan ?? '',
      precioInicial: plan ? String(plan.precioInicial) : '',
      limiteClientes: plan ? String(plan.limiteClientes) : '',
      precioPosterior: plan ? String(plan.precioPosterior) : '',
      descripcion: plan?.descripcion ?? '',
      estado: plan?.estado ?? 'ACTIVO',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: PlanSuscripcionRequest = {
      nombrePlan: valores.nombrePlan,
      precioInicial: Number(valores.precioInicial),
      limiteClientes: Number(valores.limiteClientes),
      precioPosterior: Number(valores.precioPosterior),
      descripcion: textoOpcional(valores.descripcion),
      estado: valores.estado,
    }
    const ok = await ejecutar(
      () => (plan ? actualizar.mutateAsync({ id: plan.idPlan, body }) : crear.mutateAsync(body)),
      { exito: plan ? 'Plan actualizado' : 'Plan creado', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        <TextField label="Nombre del plan" required error={errors.nombrePlan?.message} {...register('nombrePlan')} />
        <SelectField label="Estado" required options={EstadoRegistro.options} error={errors.estado?.message} {...register('estado')} />
        <TextField
          label="Precio inicial (S/)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          hint="Mensual, hasta alcanzar el límite de clientes"
          error={errors.precioInicial?.message}
          {...register('precioInicial')}
        />
        <TextField
          label="Precio posterior (S/)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          hint="Al superar el límite de clientes"
          error={errors.precioPosterior?.message}
          {...register('precioPosterior')}
        />
        <TextField
          label="Límite de clientes al mes"
          type="number"
          inputMode="numeric"
          min="1"
          required
          error={errors.limiteClientes?.message}
          {...register('limiteClientes')}
        />
        <TextAreaField label="Descripción" className="sm:col-span-2" error={errors.descripcion?.message} {...register('descripcion')} />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={plan ? 'Guardar cambios' : 'Crear plan'} />
    </form>
  )
}
