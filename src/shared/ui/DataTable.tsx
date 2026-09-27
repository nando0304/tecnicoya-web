import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { cn, coincide } from '@/shared/lib'
import { EmptyState, ErrorState, LoadingState } from './States'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  rows: T[] | undefined
  columns: Column<T>[]
  rowKey: (row: T) => number | string
  /** Texto en el que busca el cuadro de búsqueda; sin él no se muestra. */
  searchText?: (row: T) => string
  searchPlaceholder?: string
  initialSearch?: string
  actions?: (row: T) => ReactNode
  /** Filtros o botones a la derecha de la búsqueda. */
  toolbar?: ReactNode
  isLoading?: boolean
  error?: unknown
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  pageSize?: number
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchText,
  searchPlaceholder = 'Buscar…',
  initialSearch = '',
  actions,
  toolbar,
  isLoading,
  error,
  onRetry,
  emptyTitle = 'Sin registros',
  emptyDescription,
  pageSize = 10,
}: DataTableProps<T>) {
  const [busqueda, setBusqueda] = useState(initialSearch)
  const [pagina, setPagina] = useState(1)

  const filtradas = useMemo(
    () => (rows ?? []).filter((row) => !searchText || coincide(searchText(row), busqueda)),
    [rows, searchText, busqueda],
  )
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / pageSize))
  const paginaActual = Math.min(pagina, totalPaginas)
  const visibles = filtradas.slice((paginaActual - 1) * pageSize, paginaActual * pageSize)
  const desde = filtradas.length === 0 ? 0 : (paginaActual - 1) * pageSize + 1

  let contenido: ReactNode
  if (isLoading) contenido = <LoadingState />
  else if (error) contenido = <ErrorState error={error} onRetry={onRetry} />
  else if (filtradas.length === 0)
    contenido = busqueda ? (
      <EmptyState icon={Search} title="Sin resultados" description={`No hay coincidencias para “${busqueda}”.`} />
    ) : (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    )
  else
    contenido = (
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="border-base-300 bg-base-200/70 text-xs uppercase tracking-wide text-muted">
              {columns.map((col) => (
                <th key={col.header} className={cn('font-semibold', col.className)}>
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="text-right font-semibold">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibles.map((row) => (
              <tr key={rowKey(row)} className="border-base-300 transition-colors hover:bg-base-200/50">
                {columns.map((col) => (
                  <td key={col.header} className={col.className}>
                    {col.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="text-right">
                    <div className="flex justify-end gap-1">{actions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )

  return (
    <div className="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xs">
      {(searchText || toolbar) && (
        <div className="flex flex-col gap-3 border-b border-base-300 p-4 sm:flex-row sm:items-center">
          {searchText && (
            <label className="input h-10 w-full border-base-300 bg-base-200 focus-within:bg-base-100 sm:max-w-xs [--input-color:var(--color-primary)]">
              <Search className="size-4 text-muted" aria-hidden />
              <input
                type="search"
                className="grow"
                placeholder={searchPlaceholder}
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value)
                  setPagina(1)
                }}
                aria-label={searchPlaceholder}
              />
            </label>
          )}
          {toolbar && <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{toolbar}</div>}
        </div>
      )}

      {contenido}

      {!isLoading && !error && filtradas.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-base-300 px-4 py-3 text-sm text-muted sm:flex-row">
          <span>
            Mostrando {desde}–{desde + visibles.length - 1} de {filtradas.length}
          </span>
          {totalPaginas > 1 && (
            <div className="join">
              <button
                type="button"
                className="btn join-item btn-sm"
                onClick={() => setPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="btn join-item btn-sm pointer-events-none">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                className="btn join-item btn-sm"
                onClick={() => setPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                aria-label="Página siguiente"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
