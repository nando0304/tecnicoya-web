import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  EstadoUsuario,
  TipoUsuario,
  useCreateUsuario,
  useUpdateUsuario,
  type Usuario,
  type UsuarioRequest,
} from '@/entities/usuario'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, FormActions, FormGrid, SelectField, TextField } from '@/shared/ui'

function crearEsquema(esNuevo: boolean) {
  return z
    .object({
      nombres: v.texto('Ingresa los nombres', 100),
      apellidos: v.texto('Ingresa los apellidos', 100),
      correo: v.correo,
      telefono: v.telefono,
      contrasena: z.string(),
      tipoUsuario: z.enum(TipoUsuario.values),
      estado: z.enum(EstadoUsuario.values),
    })
    .superRefine(({ contrasena }, ctx) => {
      if (esNuevo && !contrasena) {
        ctx.addIssue({ code: 'custom', path: ['contrasena'], message: 'Ingresa una contraseña' })
      } else if (contrasena && (contrasena.length < 8 || contrasena.length > 72)) {
        ctx.addIssue({ code: 'custom', path: ['contrasena'], message: 'Debe tener entre 8 y 72 caracteres' })
      }
    })
}

interface UsuarioFormProps {
  usuario?: Usuario
  onSuccess: () => void
  onCancel?: () => void
}

export function UsuarioForm({ usuario, onSuccess, onCancel }: UsuarioFormProps) {
  const crear = useCreateUsuario()
  const actualizar = useUpdateUsuario()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(crearEsquema(!usuario)),
    defaultValues: {
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      correo: usuario?.correo ?? '',
      telefono: usuario?.telefono ?? '',
      contrasena: '',
      tipoUsuario: usuario?.tipoUsuario ?? 'CLIENTE',
      estado: usuario?.estado ?? 'ACTIVO',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: UsuarioRequest = {
      ...valores,
      telefono: textoOpcional(valores.telefono),
      contrasena: valores.contrasena || null,
    }
    const ok = await ejecutar(
      () => (usuario ? actualizar.mutateAsync({ id: usuario.idUsuario, body }) : crear.mutateAsync(body)),
      { exito: usuario ? 'Usuario actualizado' : 'Usuario registrado', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        <TextField label="Nombres" required error={errors.nombres?.message} {...register('nombres')} />
        <TextField label="Apellidos" required error={errors.apellidos?.message} {...register('apellidos')} />
        <TextField label="Correo electrónico" type="email" required error={errors.correo?.message} {...register('correo')} />
        <TextField label="Teléfono" type="tel" error={errors.telefono?.message} {...register('telefono')} />
        <SelectField
          label="Tipo de usuario"
          required
          options={TipoUsuario.options}
          error={errors.tipoUsuario?.message}
          {...register('tipoUsuario')}
        />
        <SelectField label="Estado" required options={EstadoUsuario.options} error={errors.estado?.message} {...register('estado')} />
        <TextField
          label={usuario ? 'Nueva contraseña' : 'Contraseña'}
          type="password"
          required={!usuario}
          autoComplete="new-password"
          hint={usuario ? 'Déjala vacía para conservar la actual' : 'Entre 8 y 72 caracteres'}
          error={errors.contrasena?.message}
          className="sm:col-span-2"
          {...register('contrasena')}
        />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={usuario ? 'Guardar cambios' : 'Registrar usuario'} />
    </form>
  )
}
