import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ConfirmDialog, DataTable, ejecutar, Modal, PageHeader, type Column } from '@/shared/ui'

interface ListQuery<T> {
  data?: T[]
  isLoading: boolean
  error: unknown
  refetch: () => unknown
}

interface CrudPageProps<T> {
  title: string
  description: string
  /** Nombre del recurso en singular: "usuario", "evidencia". */
  entidad: string
  /** Para concordar "Nuevo usuario" / "Nueva evidencia". */
  femenino?: boolean
  query: ListQuery<T>
  columns: Column<T>[]
  rowKey: (row: T) => number
  searchText: (row: T) => string
  searchPlaceholder?: string
  initialSearch?: string
  /** Filtro adicional (p. ej. por estado) controlado por la página. */
  filter?: (row: T) => boolean
  toolbar?: ReactNode
  renderForm: (props: { item?: T; cerrar: () => void }) => ReactNode
  onDelete: (row: T) => Promise<unknown>
  /** Cómo nombrar el registro en la confirmación de borrado. */
  describir: (row: T) => string
  /** Acciones rápidas adicionales por fila (aprobar, abrir enlace…). */
  rowActions?: (row: T) => ReactNode
  modalSize?: 'sm' | 'md' | 'lg'
}

/** Mantenimiento completo de un recurso: listado con búsqueda, alta, edición y eliminación. */
export function CrudPage<T>({
  title,
  description,
  entidad,
  femenino = false,
  query,
  columns,
  rowKey,
  searchText,
  searchPlaceholder,
  initialSearch,
  filter,
  toolbar,
  renderForm,
  onDelete,
  describir,
  rowActions,
  modalSize = 'md',
}: CrudPageProps<T>) {
  const [formulario, setFormulario] = useState<{ item?: T } | null>(null)
  const [aEliminar, setAEliminar] = useState<T | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const nuevo = femenino ? 'Nueva' : 'Nuevo'
  const cerrar = () => setFormulario(null)

  const confirmarEliminacion = async () => {
    if (!aEliminar) return
    setEliminando(true)
    const ok = await ejecutar(() => onDelete(aEliminar), {
      exito: `${entidad[0].toUpperCase()}${entidad.slice(1)} ${femenino ? 'eliminada' : 'eliminado'}`,
    })
    setEliminando(false)
    if (ok) setAEliminar(null)
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          <button type="button" className="btn btn-primary shadow-md shadow-primary/25" onClick={() => setFormulario({})}>
            <Plus className="size-4" />
            {nuevo} {entidad}
          </button>
        }
      />

      <DataTable
        rows={filter ? query.data?.filter(filter) : query.data}
        columns={columns}
        rowKey={rowKey}
        searchText={searchText}
        searchPlaceholder={searchPlaceholder}
        initialSearch={initialSearch}
        toolbar={toolbar}
        isLoading={query.isLoading}
        error={query.error}
        onRetry={() => void query.refetch()}
        emptyTitle={`Aún no hay registros`}
        emptyDescription={`Usa “${nuevo} ${entidad}” para registrar el primero.`}
        actions={(row) => (
          <>
            {rowActions?.(row)}
            <button
              type="button"
              className="btn btn-square btn-ghost btn-sm"
              onClick={() => setFormulario({ item: row })}
              aria-label={`Editar ${describir(row)}`}
              title="Editar"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              className="btn btn-square btn-ghost btn-sm text-error hover:bg-error/10"
              onClick={() => setAEliminar(row)}
              aria-label={`Eliminar ${describir(row)}`}
              title="Eliminar"
            >
              <Trash2 className="size-4" />
            </button>
          </>
        )}
      />

      <Modal
        open={formulario !== null}
        onClose={cerrar}
        title={formulario?.item ? `Editar ${entidad}` : `${nuevo} ${entidad}`}
        size={modalSize}
      >
        {formulario && renderForm({ item: formulario.item, cerrar })}
      </Modal>

      <ConfirmDialog
        open={aEliminar !== null}
        title={`Eliminar ${entidad}`}
        message={
          aEliminar && (
            <>
              ¿Seguro que deseas eliminar <strong className="text-base-content">{describir(aEliminar)}</strong>? Esta acción no
              se puede deshacer.
            </>
          )
        }
        loading={eliminando}
        onConfirm={confirmarEliminacion}
        onClose={() => setAEliminar(null)}
      />
    </>
  )
}
