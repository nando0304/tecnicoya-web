import { Briefcase, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import {
  duracionTexto,
  ordenarExperiencias,
  useExperiencias,
  useRemoveExperiencia,
  type ExperienciaLaboral,
} from '@/entities/experiencia'
import { ExperienciaForm } from '@/features/experiencia-form'
import { formatMesAnio } from '@/shared/lib'
import { Badge, ConfirmDialog, EmptyState, ErrorState, LoadingState, Modal, Panel, useGestion } from '@/shared/ui'

interface ExperienciaListaProps {
  tecnicoId: number
  editable?: boolean
}

export function ExperienciaLista({ tecnicoId, editable = false }: ExperienciaListaProps) {
  const { data, isLoading, error, refetch } = useExperiencias()
  const eliminar = useRemoveExperiencia()
  const gestion = useGestion<ExperienciaLaboral>()

  const experiencias = useMemo(
    () => (data ?? []).filter((e) => e.tecnicoId === tecnicoId).sort(ordenarExperiencias),
    [data, tecnicoId],
  )

  return (
    <Panel
      title="Experiencia laboral"
      description={editable ? 'Tu trayectoria ayuda a los clientes a confiar en tu trabajo.' : undefined}
      actions={
        editable && (
          <button type="button" className="btn btn-primary btn-sm" onClick={gestion.abrirNuevo}>
            <Plus className="size-4" /> Agregar experiencia
          </button>
        )
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : experiencias.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Sin experiencia registrada"
          description={editable ? 'Agrega los trabajos que has realizado.' : 'Este técnico aún no registró su experiencia.'}
        />
      ) : (
        <ol className="ml-2 space-y-7 border-l-2 border-primary-tint pl-7">
          {experiencias.map((e) => (
            <li key={e.idExperiencia} className="relative">
              <span className="absolute -left-[37px] top-1 size-4 rounded-full border-[3px] border-base-100 bg-primary ring-4 ring-primary-soft" aria-hidden />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{e.cargo}</h3>
                  <p className="text-sm text-muted">{e.empresa}</p>
                </div>
                <div className="flex items-center gap-1">
                  {e.actualidad && <Badge tone="primary">Actual</Badge>}
                  {editable && (
                    <>
                      <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={() => gestion.abrirEdicion(e)} aria-label={`Editar ${e.cargo}`}>
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-square btn-ghost btn-sm text-error"
                        onClick={() => gestion.pedirEliminar(e)}
                        aria-label={`Eliminar ${e.cargo}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs font-medium text-muted">
                {formatMesAnio(e.fechaInicio)} – {e.actualidad ? 'Actualidad' : formatMesAnio(e.fechaFin)} · {duracionTexto(e)}
              </p>
              {e.descripcion && <p className="mt-2 text-sm leading-relaxed">{e.descripcion}</p>}
            </li>
          ))}
        </ol>
      )}

      {editable && (
        <>
          <Modal
            open={gestion.formulario !== null}
            onClose={gestion.cerrarFormulario}
            title={gestion.formulario?.item ? 'Editar experiencia' : 'Agregar experiencia'}
          >
            <ExperienciaForm
              tecnicoId={tecnicoId}
              experiencia={gestion.formulario?.item}
              onSuccess={gestion.cerrarFormulario}
              onCancel={gestion.cerrarFormulario}
            />
          </Modal>
          <ConfirmDialog
            open={gestion.aEliminar !== null}
            title="Eliminar experiencia"
            message={gestion.aEliminar && <>¿Eliminar “{gestion.aEliminar.cargo}” en {gestion.aEliminar.empresa}?</>}
            loading={gestion.eliminando}
            onConfirm={() => gestion.confirmarEliminar((e) => eliminar.mutateAsync(e.idExperiencia), 'Experiencia eliminada')}
            onClose={gestion.cancelarEliminar}
          />
        </>
      )}
    </Panel>
  )
}
