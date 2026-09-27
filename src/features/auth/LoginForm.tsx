import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { INICIO_POR_ROL, login, useSession } from '@/entities/session'
import { getErrorMessage } from '@/shared/api'
import * as v from '@/shared/lib/validacion'
import { CheckboxField, TextField } from '@/shared/ui'

const esquema = z.object({
  correo: v.correo,
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
  recordar: z.boolean(),
})

/** Usuarios de database/data.sql; solo se muestran en desarrollo. */
const CUENTAS_DEMO = [
  { rol: 'Administrador', correo: 'carlos.mendoza@tecnicoya.example' },
  { rol: 'Técnico', correo: 'pedro.ramirez@tecnicoya.example' },
  { rol: 'Cliente', correo: 'maria.quispe@correo.example' },
]
const CONTRASENA_DEMO = 'TecnicoYa2026!'

export function LoginForm() {
  const navigate = useNavigate()
  const iniciar = useSession((s) => s.iniciar)
  const [verContrasena, setVerContrasena] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { correo: '', contrasena: '', recordar: false },
  })

  const onSubmit = handleSubmit(async ({ correo, contrasena, recordar }) => {
    setErrorGeneral(null)
    try {
      const usuario = await login({ correo, contrasena })
      iniciar(usuario, recordar)
      await navigate({ to: INICIO_POR_ROL[usuario.tipoUsuario] })
    } catch (error) {
      setErrorGeneral(getErrorMessage(error))
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errorGeneral && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          <AlertCircle className="size-5" />
          <span>{errorGeneral}</span>
        </div>
      )}

      <TextField
        label="Correo electrónico"
        type="email"
        icon={Mail}
        placeholder="tucorreo@ejemplo.com"
        autoComplete="email"
        error={errors.correo?.message}
        {...register('correo')}
      />
      <TextField
        label="Contraseña"
        type={verContrasena ? 'text' : 'password'}
        icon={Lock}
        placeholder="Tu contraseña"
        autoComplete="current-password"
        error={errors.contrasena?.message}
        end={
          <button
            type="button"
            className="text-muted transition-colors hover:text-primary"
            onClick={() => setVerContrasena((visible) => !visible)}
            aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {verContrasena ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...register('contrasena')}
      />

      <CheckboxField label="Recordarme en este dispositivo" {...register('recordar')} />

      <button
        type="submit"
        className="btn btn-primary btn-lg mt-1 h-12 text-base shadow-lg shadow-primary/30"
        disabled={isSubmitting}
      >
        {isSubmitting && <span className="loading loading-spinner loading-sm" />}
        Iniciar sesión
      </button>

      {import.meta.env.DEV && (
        <div className="rounded-box border border-dashed border-primary-light bg-primary-soft p-3">
          <p className="text-xs font-semibold text-primary">Cuentas de prueba (solo desarrollo)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CUENTAS_DEMO.map((cuenta) => (
              <button
                key={cuenta.correo}
                type="button"
                className="btn btn-xs border-primary-light bg-base-100 text-primary"
                onClick={() => {
                  setValue('correo', cuenta.correo, { shouldValidate: true })
                  setValue('contrasena', CONTRASENA_DEMO, { shouldValidate: true })
                }}
              >
                {cuenta.rol}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
