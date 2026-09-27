import {
  Award,
  FileCheck2,
  FileText,
  GraduationCap,
  IdCard,
  ImageIcon,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { TipoEvidencia, useEvidencias, useRemoveEvidencia, type Evidencia } from '@/entities/evidencia'
import { EvidenciaForm } from '@/features/evidencia-form'
import { formatFecha } from '@/shared/lib'
import { EstadoValidacion } from '@/shared/model/enums'
import {
  ConfirmDialog,
  EmptyState,
  EnlaceArchivo,
  ErrorState,
  LoadingState,
  Modal,
  Panel,
  StatusBadge,
  useGestion,
} from '@/shared/ui'

const ICONOS: Record<TipoEvidencia, LucideIcon> = {
  CERTIFICADO: Award,
  TITULO_PROFESIONAL: GraduationCap,
  ANTECEDENTES: ShieldCheck,
  DOCUMENTO_IDENTIDAD: IdCard,
  FOTO_TRABAJO: ImageIcon,
  OTRO: FileText,
}

/** Documentos personales: en el perfil público se confirma la verificación sin exponer el archivo. */
const PRIVADOS: TipoEvidencia[] = ['DOCUMENTO_IDENTIDAD', 'ANTECEDENTES']

interface EvidenciasListaProps {
  tecnicoId: number
  editable?: boolean
  /** Vista para clientes: solo evidencias aprobadas y sin enlaces a documentos personales. */
  publico?: boolean
}

export function EvidenciasLista({ tecnicoId, editable = false, publico = false }: EvidenciasListaProps) {
  const { data, isLoading, error, refetch } = useEvidencias()
  const eliminar = useRemoveEvidencia()
  const gestion = useGestion<Evidencia>()

  const evidencias = useMemo(
    () =>
      (data ?? [])
        .filter((e) => e.tecnicoId === tecnicoId && (!publico || e.estadoValidacion === 'APROBADO'))
        .sort((a, b) => b.fechaCarga.localeCompare(a.fechaCarga)),
    [data, tecnicoId, publico],
  )

  return (
    <Panel
      className="@container"
      title={publico ? 'Documentos verificados' : 'Evidencias'}
      description={editable ? 'Certificados, títulos y fotos de trabajos que respaldan tu experiencia.' : undefined}
      actions={
        editable && (
          <button type="button" className="btn btn-primary btn-sm" onClick={gestion.abrirNuevo}>
            <Plus className="size-4" /> Agregar evidencia
          </button>
        )
      }
    >
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : evidencias.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={publico ? 'Sin documentos verificados' : 'Sin evidencias'}
          description={editable ? 'Sube tus certificados y documentos para que el equipo verifique tu perfil.' : undefined}
        />
      ) : (
        <div className="grid gap-4 @lg:grid-cols-2 @3xl:grid-cols-3">
          {evidencias.map((e) => {
            const Icono = ICONOS[e.tipoEvidencia]
            const ocultarArchivo = publico && PRIVADOS.includes(e.tipoEvidencia)
            return (
              <article key={e.idEvidencia} className="flex flex-col rounded-xl border border-base-300 p-4 transition-colors hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icono className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold leading-tight">{TipoEvidencia.label(e.tipoEvidencia)}</p>
                    <p className="mt-0.5 text-xs text-muted">Cargada el {formatFecha(e.fechaCarga)}</p>
                  </div>
                  {!publico && <StatusBadge def={EstadoValidacion} value={e.estadoValidacion} />}
                </div>
                {e.descripcion && <p className="mt-3 line-clamp-2 text-sm text-muted">{e.descripcion}</p>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  {ocultarArchivo ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                      <ShieldCheck className="size-4" /> Verificado por TécnicoYa
                    </span>
                  ) : (
                    <EnlaceArchivo url={e.urlArchivo} texto="Ver archivo" />
                  )}
                  {editable && (
                    <span className="flex">
                      <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={() => gestion.abrirEdicion(e)} aria-label="Editar evidencia">
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-square btn-ghost btn-sm text-error"
                        onClick={() => gestion.pedirEliminar(e)}
                        aria-label="Eliminar evidencia"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editable && (
        <>
          <Modal
            open={gestion.formulario !== null}
            onClose={gestion.cerrarFormulario}
            title={gestion.formulario?.item ? 'Editar evidencia' : 'Agregar evidencia'}
          >
            <EvidenciaForm
              tecnicoId={tecnicoId}
              evidencia={gestion.formulario?.item}
              onSuccess={gestion.cerrarFormulario}
              onCancel={gestion.cerrarFormulario}
            />
          </Modal>
          <ConfirmDialog
            open={gestion.aEliminar !== null}
            title="Eliminar evidencia"
            message={gestion.aEliminar && <>¿Eliminar la evidencia “{TipoEvidencia.label(gestion.aEliminar.tipoEvidencia)}”?</>}
            loading={gestion.eliminando}
            onConfirm={() => gestion.confirmarEliminar((e) => eliminar.mutateAsync(e.idEvidencia), 'Evidencia eliminada')}
            onClose={gestion.cancelarEliminar}
          />
        </>
      )}
    </Panel>
  )
}
