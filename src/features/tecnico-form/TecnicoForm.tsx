import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  EstadoVerificacion,
  useCreateTecnico,
  useTecnicos,
  useUpdateTecnico,
  type Tecnico,
  type TecnicoRequest,
} from '@/entities/tecnico'
import { nombreCompleto, useUsuarios } from '@/entities/usuario'
import { textoOpcional } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, FormActions, FormGrid, SelectField, TextAreaField, TextField } from '@/shared/ui'

const esquema = z.object({
  usuarioId: v.seleccion('Selecciona el usuario'),
  especialidad: v.texto('Ingresa la especialidad', 100),
  descripcion: v.textoLibre(1000),
  estadoVerificacion: z.enum(EstadoVerificacion.values),
})

interface TecnicoFormProps {
  tecnico?: Tecnico
  /** Usuario fijo: el propio técnico completando su perfil. */
  usuarioId?: number
  /** Solo el administrador cambia el estado de verificación. */
  puedeVerificar?: boolean
  onSuccess: () => void
  onCancel?: () => void
  submitLabel?: string
}

export function TecnicoForm({ tecnico, usuarioId, puedeVerificar = false, onSuccess, onCancel, submitLabel }: TecnicoFormProps) {
  const crear = useCreateTecnico()
  const actualizar = useUpdateTecnico()
  const eligeUsuario = !tecnico && usuarioId === undefined
  const usuarios = useUsuarios({ enabled: eligeUsuario })
  const tecnicos = useTecnicos({ enabled: eligeUsuario })

  // Usuarios de tipo TECNICO que aún no tienen perfil profesional
  const opcionesUsuario = useMemo(() => {
    const conPerfil = new Set(tecnicos.data?.map((t) => t.usuarioId))
    return (usuarios.data ?? [])
      .filter((u) => u.tipoUsuario === 'TECNICO' && !conPerfil.has(u.idUsuario))
      .map((u) => ({ value: u.idUsuario, label: `${nombreCompleto(u)} · ${u.correo}` }))
  }, [usuarios.data, tecnicos.data])

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      usuarioId: String(tecnico?.usuarioId ?? usuarioId ?? ''),
      especialidad: tecnico?.especialidad ?? '',
      descripcion: tecnico?.descripcion ?? '',
      estadoVerificacion: tecnico?.estadoVerificacion ?? 'PENDIENTE',
    },
  })

  const onSubmit = handleSubmit(async (valores) => {
    const body: TecnicoRequest = {
      usuarioId: Number(valores.usuarioId),
      especialidad: valores.especialidad,
      descripcion: textoOpcional(valores.descripcion),
      estadoVerificacion: puedeVerificar ? valores.estadoVerificacion : null,
    }
    const ok = await ejecutar(
      () => (tecnico ? actualizar.mutateAsync({ id: tecnico.idTecnico, body }) : crear.mutateAsync(body)),
      { exito: tecnico ? 'Perfil técnico actualizado' : 'Perfil técnico registrado', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        {eligeUsuario ? (
          <SelectField
            label="Usuario"
            required
            placeholder={usuarios.isLoading ? 'Cargando…' : 'Selecciona un usuario técnico'}
            options={opcionesUsuario}
            hint={opcionesUsuario.length === 0 && !usuarios.isLoading ? 'No hay usuarios técnicos sin perfil. Registra uno primero.' : undefined}
            error={errors.usuarioId?.message}
            className="sm:col-span-2"
            {...register('usuarioId')}
          />
        ) : (
          tecnico && (
            <div className="rounded-box bg-base-200 px-4 py-3 text-sm sm:col-span-2">
              <span className="text-muted">Técnico: </span>
              <span className="font-medium">{tecnico.nombreCompleto}</span>
            </div>
          )
        )}
        <TextField
          label="Especialidad"
          required
          placeholder="Ej. Electricidad"
          error={errors.especialidad?.message}
          className={puedeVerificar ? undefined : 'sm:col-span-2'}
          {...register('especialidad')}
        />
        {puedeVerificar && (
          <SelectField
            label="Verificación"
            required
            options={EstadoVerificacion.options}
            error={errors.estadoVerificacion?.message}
            {...register('estadoVerificacion')}
          />
        )}
        <TextAreaField
          label="Descripción profesional"
          rows={4}
          placeholder="Servicios que ofrece, experiencia y zonas de atención"
          error={errors.descripcion?.message}
          className="sm:col-span-2"
          {...register('descripcion')}
        />
      </FormGrid>
      <FormActions onCancel={onCancel} loading={isSubmitting} submitLabel={submitLabel ?? (tecnico ? 'Guardar cambios' : 'Registrar técnico')} />
    </form>
  )
}
