import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useSession } from '@/entities/session'
import { toUsuarioRequest, useUpdateUsuario, type Usuario } from '@/entities/usuario'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, FormActions, FormGrid, TextField } from '@/shared/ui'

const esquema = z.object({
  nombres: v.texto('Ingresa tus nombres', 100),
  apellidos: v.texto('Ingresa tus apellidos', 100),
  correo: v.correo,
  telefono: v.telefono,
})

interface DatosPersonalesFormProps {
  usuario: Usuario
  onSuccess?: () => void
  onCancel?: () => void
}

/** Datos del propio usuario. Tras guardar, actualiza también la sesión. */
export function DatosPersonalesForm({ usuario, onSuccess, onCancel }: DatosPersonalesFormProps) {
  const actualizar = useUpdateUsuario()
  const actualizarSesion = useSession((s) => s.actualizar)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      telefono: usuario.telefono ?? '',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const ok = await ejecutar(
      async () => {
        const actualizado = await actualizar.mutateAsync({
          id: usuario.idUsuario,
          body: toUsuarioRequest(usuario, { ...valores, telefono: textoOpcional(valores.telefono) }),
        })
        actualizarSesion(actualizado)
      },
      { exito: 'Datos actualizados', setError },
    )
    if (ok) onSuccess?.()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        <TextField label="Nombres" required autoComplete="given-name" error={errors.nombres?.message} {...register('nombres')} />
        <TextField label="Apellidos" required autoComplete="family-name" error={errors.apellidos?.message} {...register('apellidos')} />
        <TextField label="Correo electrónico" type="email" required autoComplete="email" error={errors.correo?.message} {...register('correo')} />
        <TextField label="Teléfono" type="tel" autoComplete="tel" error={errors.telefono?.message} {...register('telefono')} />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel="Guardar cambios" />
    </form>
  )
}
