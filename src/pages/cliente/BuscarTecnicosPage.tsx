import { Search, UserSearch } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Tecnico } from '@/entities/tecnico'
import { coincide } from '@/shared/lib'
import { useBusquedaInicial } from '@/shared/lib/use-busqueda'
import { EmptyState, ErrorState, LoadingState, PageHeader } from '@/shared/ui'
import { porReputacion, SolicitarServicioModal, TecnicoCard, useDirectorioTecnicos, type EntradaDirectorio } from '@/widgets/tecnico-card'

type Orden = 'reputacion' | 'resenas' | 'nombre'

const ORDENES: Record<Orden, { label: string; comparar: (a: EntradaDirectorio, b: EntradaDirectorio) => number }> = {
  reputacion: { label: 'Mejor calificados', comparar: porReputacion },
  resenas: { label: 'Más reseñas', comparar: (a, b) => b.resumen.total - a.resumen.total },
  nombre: { label: 'Nombre (A–Z)', comparar: (a, b) => a.tecnico.nombreCompleto.localeCompare(b.tecnico.nombreCompleto) },
}

export function BuscarTecnicosPage() {
  const busqueda = useBusquedaInicial()
  return <Buscador key={busqueda} busquedaInicial={busqueda} />
}

function Buscador({ busquedaInicial }: { busquedaInicial: string }) {
  const { directorio, isLoading, error, refetch } = useDirectorioTecnicos()
  const [texto, setTexto] = useState(busquedaInicial)
  const [especialidad, setEspecialidad] = useState('')
  const [orden, setOrden] = useState<Orden>('reputacion')
  const [solicitarA, setSolicitarA] = useState<Tecnico | null>(null)

  const especialidades = useMemo(
    () => [...new Set(directorio.map((d) => d.tecnico.especialidad))].sort((a, b) => a.localeCompare(b)),
    [directorio],
  )

  const resultados = directorio
    .filter(
      ({ tecnico }) =>
        (!especialidad || tecnico.especialidad === especialidad) &&
        coincide(`${tecnico.nombreCompleto} ${tecnico.especialidad} ${tecnico.descripcion ?? ''}`, texto),
    )
    .sort(ORDENES[orden].comparar)

  return (
    <>
      <PageHeader title="Buscar técnicos" description="Todos los técnicos verificados por TécnicoYa. Revisa su perfil y solicita un servicio." />

      <div className="mb-6 flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-4 shadow-xs md:flex-row">
        <label className="input h-11 flex-1 border-base-300 bg-base-200 focus-within:bg-base-100">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            type="search"
            className="grow"
            placeholder="Nombre, especialidad o servicio (p. ej. terma, cortocircuito)…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-label="Buscar técnicos"
          />
        </label>
        <select className="select h-11 border-base-300 bg-base-200 md:w-56" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} aria-label="Especialidad">
          <option value="">Todas las especialidades</option>
          {especialidades.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select className="select h-11 border-base-300 bg-base-200 md:w-48" value={orden} onChange={(e) => setOrden(e.target.value as Orden)} aria-label="Ordenar por">
          {Object.entries(ORDENES).map(([id, o]) => (
            <option key={id} value={id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : resultados.length === 0 ? (
        <div className="rounded-box border border-base-300 bg-base-100">
          <EmptyState
            icon={UserSearch}
            title="No encontramos técnicos con esos filtros"
            description="Prueba con otra especialidad o crea una solicitud abierta: cualquier técnico verificado podrá tomarla."
            action={
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setTexto('')
                  setEspecialidad('')
                }}
              >
                Limpiar filtros
              </button>
            }
          />
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted">
            {resultados.length} {resultados.length === 1 ? 'técnico encontrado' : 'técnicos encontrados'}
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {resultados.map(({ tecnico, resumen, dias }) => (
              <TecnicoCard key={tecnico.idTecnico} tecnico={tecnico} resumen={resumen} dias={dias} onSolicitar={() => setSolicitarA(tecnico)} />
            ))}
          </div>
        </>
      )}

      <SolicitarServicioModal open={solicitarA !== null} onClose={() => setSolicitarA(null)} tecnico={solicitarA} />
    </>
  )
}
