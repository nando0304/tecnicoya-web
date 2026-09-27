import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { login } from '@/entities/session'
import { toUsuarioRequest, useUpdateUsuario, type Usuario } from '@/entities/usuario'
import { ApiError, getErrorMessage } from '@/shared/api'
import { ejecutar, FormActions, TextField, toast } from '@/shared/ui'

const esquema = z
  .object({
    actual: z.string().min(1, 'Ingresa tu contraseña actual'),
    nueva: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
    confirmacion: z.string(),
  })
  .refine((f) => f.nueva === f.confirmacion, { path: ['confirmacion'], message: 'Las contraseñas no coinciden' })
  .refine((f) => f.nueva !== f.actual, { path: ['nueva'], message: 'Debe ser distinta de la actual' })

export function CambiarContrasenaForm({ usuario }: { usuario: Usuario }) {
  const actualizar = useUpdateUsuario()
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { actual: '', nueva: '', confirmacion: '' } })

  const onSubmit = handleSubmit(async ({ actual, nueva }) => {
    // La API no pide la contraseña actual al actualizar: se comprueba antes con el login
    try {
      await login({ correo: usuario.correo, contrasena: actual })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('actual', { message: 'La contraseña actual no es correcta' })
      } else {
        toast.error(getErrorMessage(error))
      }
      return
    }
    const ok = await ejecutar(
      () => actualizar.mutateAsync({ id: usuario.idUsuario, body: toUsuarioRequest(usuario, { contrasena: nueva }) }),
      { exito: 'Contraseña actualizada' },
    )
    if (ok) reset()
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-4">
      <TextField label="Contraseña actual" type="password" autoComplete="current-password" required error={errors.actual?.message} {...register('actual')} />
      <TextField
        label="Nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        hint="Entre 8 y 72 caracteres"
        error={errors.nueva?.message}
        {...register('nueva')}
      />
      <TextField
        label="Confirmar nueva contraseña"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmacion?.message}
        {...register('confirmacion')}
      />
      <FormActions loading={isSubmitting} submitLabel="Actualizar contraseña" />
    </form>
  )
}
