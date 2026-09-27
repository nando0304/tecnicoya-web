import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle, Lock, Mail, Phone, UserRound, Wrench } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { INICIO_POR_ROL, login, useSession } from '@/entities/session'
import { tecnicoApi } from '@/entities/tecnico'
import { usuarioApi } from '@/entities/usuario'
import { ApiError, getErrorMessage } from '@/shared/api'
import { cn, textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { FormGrid, TextAreaField, TextField } from '@/shared/ui'

const esquema = z
  .object({
    tipoUsuario: z.enum(['CLIENTE', 'TECNICO']),
    nombres: v.texto('Ingresa tus nombres', 100),
    apellidos: v.texto('Ingresa tus apellidos', 100),
    correo: v.correo,
    telefono: v.telefono,
    contrasena: z.string().min(8, 'Mínimo 8 caracteres').max(72, 'Máximo 72 caracteres'),
    confirmacion: z.string(),
    especialidad: v.textoLibre(100),
    descripcion: v.textoLibre(1000),
  })
  .superRefine((valores, ctx) => {
    if (valores.contrasena !== valores.confirmacion) {
      ctx.addIssue({ code: 'custom', path: ['confirmacion'], message: 'Las contraseñas no coinciden' })
    }
    if (valores.tipoUsuario === 'TECNICO' && !valores.especialidad) {
      ctx.addIssue({ code: 'custom', path: ['especialidad'], message: 'Indica tu especialidad' })
    }
  })

const TIPOS = [
  { value: 'CLIENTE', icon: UserRound, titulo: 'Necesito un técnico', detalle: 'Solicita servicios a domicilio' },
  { value: 'TECNICO', icon: Wrench, titulo: 'Soy técnico', detalle: 'Ofrece tus servicios y consigue clientes' },
] as const

export function RegisterForm() {
  const navigate = useNavigate()
  const iniciar = useSession((s) => s.iniciar)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tipoUsuario: 'CLIENTE' as const,
      nombres: '',
      apellidos: '',
      correo: '',
      telefono: '',
      contrasena: '',
      confirmacion: '',
      especialidad: '',
      descripcion: '',
    },
  })
  const tipo = useWatch({ control, name: 'tipoUsuario' })

  const onSubmit = handleSubmit(async (valores) => {
    setErrorGeneral(null)
    let usuarioId: number
    try {
      const usuario = await usuarioApi.create({
        nombres: valores.nombres,
        apellidos: valores.apellidos,
        correo: valores.correo,
        telefono: textoOpcional(valores.telefono),
        contrasena: valores.contrasena,
        tipoUsuario: valores.tipoUsuario,
        estado: 'ACTIVO',
      })
      usuarioId = usuario.idUsuario
    } catch (error) {
      if (error instanceof ApiError) {
        for (const [campo, mensaje] of Object.entries(error.fieldErrors)) {
          setError(campo as keyof typeof valores, { type: 'server', message: mensaje })
        }
      }
      setErrorGeneral(getErrorMessage(error))
      return
    }

    // La cuenta ya existe: si falla el perfil técnico, podrá completarlo al iniciar sesión
    if (valores.tipoUsuario === 'TECNICO') {
      await tecnicoApi
        .create({ usuarioId, especialidad: valores.especialidad, descripcion: textoOpcional(valores.descripcion) })
        .catch(() => undefined)
    }

    try {
      const usuario = await login({ correo: valores.correo, contrasena: valores.contrasena })
      iniciar(usuario, false)
      await navigate({ to: INICIO_POR_ROL[usuario.tipoUsuario] })
    } catch {
      await navigate({ to: '/login' })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {errorGeneral && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          <AlertCircle className="size-5" />
          <span>{errorGeneral}</span>
        </div>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">¿Cómo usarás TécnicoYa?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPOS.map(({ value, icon: Icon, titulo, detalle }) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-box border-2 p-4 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-primary',
                tipo === value ? 'border-primary bg-primary-soft' : 'border-base-300 hover:border-primary-light',
              )}
            >
              <input type="radio" value={value} className="sr-only" {...register('tipoUsuario')} />
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-lg',
                  tipo === value ? 'bg-primary text-primary-content' : 'bg-base-200 text-muted',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold">{titulo}</span>
                <span className="block text-xs text-muted">{detalle}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <FormGrid>
        <TextField label="Nombres" required autoComplete="given-name" error={errors.nombres?.message} {...register('nombres')} />
        <TextField label="Apellidos" required autoComplete="family-name" error={errors.apellidos?.message} {...register('apellidos')} />
        <TextField
          label="Correo electrónico"
          type="email"
          required
          icon={Mail}
          autoComplete="email"
          error={errors.correo?.message}
          {...register('correo')}
        />
        <TextField
          label="Teléfono"
          type="tel"
          icon={Phone}
          placeholder="987654321"
          autoComplete="tel"
          error={errors.telefono?.message}
          {...register('telefono')}
        />
        <TextField
          label="Contraseña"
          type="password"
          required
          icon={Lock}
          autoComplete="new-password"
          hint="Mínimo 8 caracteres"
          error={errors.contrasena?.message}
          {...register('contrasena')}
        />
        <TextField
          label="Confirmar contraseña"
          type="password"
          required
          icon={Lock}
          autoComplete="new-password"
          error={errors.confirmacion?.message}
          {...register('confirmacion')}
        />
      </FormGrid>

      {tipo === 'TECNICO' && (
        <div className="flex flex-col gap-4 rounded-box border border-base-300 bg-base-200/60 p-4">
          <TextField
            label="Especialidad"
            required
            placeholder="Ej. Electricidad, Plomería, Refrigeración"
            error={errors.especialidad?.message}
            {...register('especialidad')}
          />
          <TextAreaField
            label="Descripción profesional"
            placeholder="Cuéntales a los clientes qué servicios ofreces"
            error={errors.descripcion?.message}
            {...register('descripcion')}
          />
          <p className="text-xs text-muted">
            Tu perfil quedará pendiente de verificación hasta que un administrador lo revise.
          </p>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-lg h-12 text-base shadow-lg shadow-primary/30" disabled={isSubmitting}>
        {isSubmitting && <span className="loading loading-spinner loading-sm" />}
        Crear cuenta
      </button>
    </form>
  )
}
