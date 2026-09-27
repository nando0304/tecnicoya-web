import { useSearch } from '@tanstack/react-router'

/** Texto buscado desde la barra superior (?q=), para iniciar el filtro de la página. */
export function useBusquedaInicial(): string {
  const search = useSearch({ strict: false }) as { q?: unknown }
  return typeof search.q === 'string' ? search.q : ''
}
