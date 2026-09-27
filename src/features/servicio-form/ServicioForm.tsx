import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  EstadoServicio,
  estaCerrado,
  Prioridad,
  useCreateServicio,
  useUpdateServicio,
  type Servicio,
  type ServicioRequest,
} from '@/entities/servicio'
import { useTecnicos } from '@/entities/tecnico'
import { nombreCompleto, useUsuarios } from '@/entities/usuario'
import { aInputFechaHora, ahoraInput } from '@/shared/lib'
import * as v from '@/shared/lib/validacion'
import { ejecutar, FormActions, FormGrid, SelectField, TextAreaField, TextField } from '@/shared/ui'

const esquema = z.object({
  clienteId: v.seleccion('Selecciona el cliente'),
  tecnicoId: z.string(),
  titulo: v.texto('Ingresa un título', 150),
  descripcionProblema: v.texto('Describe el problema', 1000),
  estadoServicio: z.enum(EstadoServicio.values),
  prioridad: z.enum(Prioridad.values),
  fechaServicio: z.string(),
  fechaCierre: z.string(),
})

interface ServicioFormProps {
  servicio?: Servicio
  /** admin: edita todo. cliente: solo los datos de su solicitud. */
  modo: 'admin' | 'cliente'
  /** Cliente de la sesión (modo cliente). */
  clienteId?: number
  /** Técnico elegido desde su perfil: queda fijo. */
  tecnicoFijo?: { idTecnico: number; nombreCompleto: string }
  onSuccess: () => void
  onCancel?: () => void
}

export function ServicioForm({ servicio, modo, clienteId, tecnicoFijo, onSuccess, onCancel }: ServicioFormProps) {
  const esAdmin = modo === 'admin'
  const crear = useCreateServicio()
  const actualizar = useUpdateServicio()
  const usuarios = useUsuarios({ enabled: esAdmin })
  const tecnicos = useTecnicos({ enabled: !tecnicoFijo })

  const opcionesCliente = useMemo(
    () =>
      (usuarios.data ?? [])
        .filter((u) => u.tipoUsuario === 'CLIENTE' && (u.estado === 'ACTIVO' || u.idUsuario === servicio?.clienteId))
        .map((u) => ({ value: u.idUsuario, label: nombreCompleto(u) })),
    [usuarios.data, servicio?.clienteId],
  )
  // Solo se pueden asignar técnicos verificados
  const opcionesTecnico = useMemo(
    () =>
      (tecnicos.data ?? [])
        .filter((t) => t.estadoVerificacion === 'VERIFICADO' || t.idTecnico === servicio?.tecnicoId)
        .map((t) => ({ value: t.idTecnico, label: `${t.nombreCompleto} · ${t.especialidad}` })),
    [tecnicos.data, servicio?.tecnicoId],
  )

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      clienteId: String(servicio?.clienteId ?? clienteId ?? ''),
      tecnicoId: String(servicio?.tecnicoId ?? tecnicoFijo?.idTecnico ?? ''),
      titulo: servicio?.titulo ?? '',
      descripcionProblema: servicio?.descripcionProblema ?? '',
      estadoServicio: servicio?.estadoServicio ?? 'PENDIENTE',
      prioridad: servicio?.prioridad ?? 'MEDIA',
      fechaServicio: aInputFechaHora(servicio?.fechaServicio),
      fechaCierre: aInputFechaHora(servicio?.fechaCierre),
    },
  })
  const estado = useWatch({ control, name: 'estadoServicio' })

  const onSubmit = handleSubmit(async (valores) => {
    const tecnicoId = valores.tecnicoId ? Number(valores.tecnicoId) : null
    if (!esAdmin && !servicio && valores.fechaServicio && valores.fechaServicio < ahoraInput()) {
      setError('fechaServicio', { message: 'Elige una fecha futura' })
      return
    }

    // Al crear como cliente va en null: la API decide PENDIENTE o ASIGNADO según haya técnico
    let estadoServicio: ServicioRequest['estadoServicio'] = esAdmin ? valores.estadoServicio : null
    // Al editar, el cliente no elige el estado: asignar o quitar técnico mueve la solicitud entre PENDIENTE y ASIGNADO
    if (!esAdmin && servicio) {
      estadoServicio = servicio.estadoServicio
      if (servicio.estadoServicio === 'PENDIENTE' && tecnicoId) estadoServicio = 'ASIGNADO'
      if (servicio.estadoServicio === 'ASIGNADO' && !tecnicoId) estadoServicio = 'PENDIENTE'
    }

    const body: ServicioRequest = {
      clienteId: Number(valores.clienteId),
      tecnicoId,
      titulo: valores.titulo,
      descripcionProblema: valores.descripcionProblema,
      estadoServicio,
      prioridad: valores.prioridad,
      fechaServicio: valores.fechaServicio || null,
      fechaCierre: esAdmin && estaCerrado(valores.estadoServicio) && valores.fechaCierre ? valores.fechaCierre : null,
    }
    const ok = await ejecutar(
      () => (servicio ? actualizar.mutateAsync({ id: servicio.idServicio, body }) : crear.mutateAsync(body)),
      { exito: servicio ? 'Servicio actualizado' : esAdmin ? 'Servicio registrado' : 'Solicitud enviada', setError },
    )
    if (ok) onSuccess()
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormGrid>
        {esAdmin && (
          <SelectField
            label="Cliente"
            required
            placeholder={usuarios.isLoading ? 'Cargando…' : 'Selecciona el cliente'}
            options={opcionesCliente}
            error={errors.clienteId?.message}
            {...register('clienteId')}
          />
        )}
        {tecnicoFijo ? (
          <div className="rounded-box bg-primary-soft px-4 py-3 text-sm sm:col-span-2">
            <span className="text-muted">Técnico: </span>
            <span className="font-semibold text-primary">{tecnicoFijo.nombreCompleto}</span>
          </div>
        ) : (
          <SelectField
            label="Técnico"
            placeholder={esAdmin ? 'Sin asignar' : 'Que lo tome cualquier técnico disponible'}
            options={opcionesTecnico}
            hint={esAdmin ? undefined : 'Opcional: elige un técnico verificado'}
            error={errors.tecnicoId?.message}
            className={esAdmin ? undefined : 'sm:col-span-2'}
            {...register('tecnicoId')}
          />
        )}
        <TextField
          label="Título"
          required
          placeholder="Ej. Cortocircuito en la cocina"
          error={errors.titulo?.message}
          className="sm:col-span-2"
          {...register('titulo')}
        />
        <TextAreaField
          label="Descripción del problema"
          required
          rows={4}
          placeholder="Cuéntanos qué pasa, desde cuándo y cualquier detalle útil"
          error={errors.descripcionProblema?.message}
          className="sm:col-span-2"
          {...register('descripcionProblema')}
        />
        <SelectField label="Prioridad" required options={Prioridad.options} error={errors.prioridad?.message} {...register('prioridad')} />
        <TextField
          label={esAdmin ? 'Fecha del servicio' : 'Fecha preferida'}
          type="datetime-local"
          min={!esAdmin && !servicio ? ahoraInput() : undefined}
          error={errors.fechaServicio?.message}
          {...register('fechaServicio')}
        />
        {esAdmin && (
          <SelectField label="Estado" required options={EstadoServicio.options} error={errors.estadoServicio?.message} {...register('estadoServicio')} />
        )}
        {esAdmin && estaCerrado(estado) && (
          <TextField
            label="Fecha de cierre"
            type="datetime-local"
            hint="Vacía: se registra la fecha actual"
            error={errors.fechaCierre?.message}
            {...register('fechaCierre')}
          />
        )}
      </FormGrid>
      <FormActions
        onCancel={onCancel}
        loading={isSubmitting}
        submitLabel={servicio ? 'Guardar cambios' : esAdmin ? 'Registrar servicio' : 'Enviar solicitud'}
      />
    </form>
  )
}
