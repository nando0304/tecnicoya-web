import { CalendarDays, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import {
  DiaSemana,
  ordenarDisponibilidad,
  useDisponibilidades,
  useRemoveDisponibilidad,
  type Disponibilidad,
} from '@/entities/disponibilidad'
import { DisponibilidadForm } from '@/features/disponibilidad-form'
import { cn, formatHora } from '@/shared/lib'
import { Badge, ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, Panel, useGestion } from '@/shared/ui'

interface DisponibilidadSemanalProps {
  tecnicoId: number
  /** El propio técnico puede agregar, editar y quitar franjas. */
  editable?: boolean
}

export function DisponibilidadSemanal({ tecnicoId, editable = false }: DisponibilidadSemanalProps) {
  const { data, isLoading, error, refetch } = useDisponibilidades()
  const eliminar = useRemoveDisponibilidad()
  const gestion = useGestion<Disponibilidad>()

  const porDia = useMemo(() => {
    const franjas = (data ?? [])
      .filter((d) => d.tecnicoId === tecnicoId && (editable || d.estado === 'ACTIVO'))
      .sort(ordenarDisponibilidad)
    return DiaSemana.values.map((dia) => ({ dia, franjas: franjas.filter((f) => f.diaSemana === dia) }))
  }, [data, tecnicoId, editable])
  const hayFranjas = porDia.some((d) => d.franjas.length > 0)

  const rango = (f: Disponibilidad) => `${DiaSemana.label(f.diaSemana)} ${formatHora(f.horaInicio)} – ${formatHora(f.horaFin)}`

  return (
    <Panel
      className="@container"
      title="Horario de atención"
      description={editable ? 'Días y horas en que puedes atender servicios a domicilio.' : undefined}
      actions={
        editable && (
          <button type="button" className="btn btn-primary btn-sm" onClick={gestion.abrirNuevo}>
            <Plus className="size-4" /> Agregar horario
          </button>
        )
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !hayFranjas ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin horarios registrados"
          description={editable ? 'Agrega los días y horas en que atiendes para que los clientes te encuentren.' : 'Este técnico aún no publicó su disponibilidad.'}
        />
      ) : (
        <div className="grid gap-3 @md:grid-cols-2 @3xl:grid-cols-4">
          {porDia.map(({ dia, franjas }) => (
            <div
              key={dia}
              className={cn(
                'rounded-xl border p-3.5',
                franjas.length ? 'border-primary/20 bg-primary-soft/60' : 'border-dashed border-base-300',
              )}
            >
              <p className={cn('text-sm font-semibold', !franjas.length && 'text-muted')}>{DiaSemana.label(dia)}</p>
              {franjas.length === 0 ? (
                <p className="mt-1.5 text-xs text-muted">Sin atención</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {franjas.map((f) => (
                    <li
                      key={f.idDisponibilidad}
                      className="flex items-center justify-between gap-1 rounded-lg bg-base-100 py-1.5 pl-2.5 pr-1 text-sm font-medium shadow-xs"
                    >
                      <span className={cn('flex items-center gap-1.5', f.estado === 'INACTIVO' && 'text-muted')}>
                        <Clock className="size-3.5 text-primary" aria-hidden />
                        {formatHora(f.horaInicio)} – {formatHora(f.horaFin)}
                        {f.estado === 'INACTIVO' && <Badge className="ml-1">Inactivo</Badge>}
                      </span>
                      {editable && (
                        <span className="flex shrink-0">
                          <button type="button" className="btn btn-square btn-ghost btn-xs" onClick={() => gestion.abrirEdicion(f)} aria-label={`Editar ${rango(f)}`}>
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-square btn-ghost btn-xs text-error"
                            onClick={() => gestion.pedirEliminar(f)}
                            aria-label={`Eliminar ${rango(f)}`}
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {editable && (
        <>
          <Modal
            open={gestion.formulario !== null}
            onClose={gestion.cerrarFormulario}
            title={gestion.formulario?.item ? 'Editar horario' : 'Agregar horario'}
            size="sm"
          >
            <DisponibilidadForm
              tecnicoId={tecnicoId}
              disponibilidad={gestion.formulario?.item}
              onSuccess={gestion.cerrarFormulario}
              onCancel={gestion.cerrarFormulario}
            />
          </Modal>
          <ConfirmDialog
            open={gestion.aEliminar !== null}
            title="Eliminar horario"
            message={gestion.aEliminar && <>¿Quitar la franja del {rango(gestion.aEliminar)}?</>}
            loading={gestion.eliminando}
            onConfirm={() => gestion.confirmarEliminar((f) => eliminar.mutateAsync(f.idDisponibilidad), 'Horario eliminado')}
            onClose={gestion.cancelarEliminar}
          />
        </>
      )}
    </Panel>
  )
}
