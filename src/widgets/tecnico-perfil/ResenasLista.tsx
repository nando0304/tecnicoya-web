import { MessageSquareQuote, Star } from 'lucide-react'
import { useMemo } from 'react'
import { resumirCalificaciones, useCalificaciones } from '@/entities/calificacion'
import { useServicios } from '@/entities/servicio'
import { formatFecha } from '@/shared/lib'
import { Avatar, EmptyState, ErrorState, LoadingState, Panel, Stars } from '@/shared/ui'

interface ResenasListaProps {
  tecnicoId: number
  /** Cantidad máxima de reseñas a mostrar (p. ej. en el inicio). */
  limite?: number
  titulo?: string
}

export function ResenasLista({ tecnicoId, limite, titulo = 'Reseñas de clientes' }: ResenasListaProps) {
  const { data, isLoading, error, refetch } = useCalificaciones()
  const servicios = useServicios()

  const { resenas, resumen } = useMemo(() => {
    const propias = (data ?? [])
      .filter((c) => c.tecnicoId === tecnicoId)
      .sort((a, b) => b.fechaCalificacion.localeCompare(a.fechaCalificacion))
    // La calificación no trae el cliente: se toma del servicio (solo el primer nombre, por privacidad)
    const clientes = new Map(servicios.data?.map((s) => [s.idServicio, s.clienteNombre.split(' ')[0]]))
    return {
      resumen: resumirCalificaciones(propias),
      resenas: propias.map((c) => ({ ...c, cliente: clientes.get(c.servicioId) ?? 'Cliente' })),
    }
  }, [data, servicios.data, tecnicoId])

  const visibles = limite ? resenas.slice(0, limite) : resenas

  return (
    <Panel title={titulo}>
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : resenas.length === 0 ? (
        <EmptyState icon={MessageSquareQuote} title="Aún no hay reseñas" description="Las calificaciones aparecen cuando un cliente evalúa un servicio finalizado." />
      ) : (
        <div className={limite ? '' : 'grid gap-8 lg:grid-cols-[240px_1fr]'}>
          {!limite && (
            <div className="rounded-xl bg-base-200/70 p-5 lg:self-start">
              <p className="text-5xl font-bold tracking-tight">{resumen.promedio.toFixed(1)}</p>
              <Stars value={resumen.promedio} className="mt-2" />
              <p className="mt-1 text-sm text-muted">
                {resumen.total} {resumen.total === 1 ? 'reseña' : 'reseñas'} · {resumen.satisfechos}% satisfechos
              </p>
              <div className="mt-4 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-2 font-medium">{n}</span>
                    <Star className="size-3 fill-accent text-accent" aria-hidden />
                    <progress
                      className="progress progress-accent h-2 flex-1"
                      value={resumen.distribucion[n - 1]}
                      max={resumen.total}
                      aria-label={`${n} estrellas: ${resumen.distribucion[n - 1]}`}
                    />
                    <span className="w-4 text-right text-muted">{resumen.distribucion[n - 1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ul className="divide-y divide-base-300">
            {visibles.map((r) => (
              <li key={r.idCalificacion} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <Avatar nombre={r.cliente} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{r.cliente}</p>
                      <span className="text-xs text-muted">{formatFecha(r.fechaCalificacion)}</span>
                    </div>
                    <Stars value={r.puntuacion} className="mt-0.5" />
                    {r.comentario && <p className="mt-2 text-sm leading-relaxed">{r.comentario}</p>}
                    <p className="mt-1.5 text-xs text-muted">Servicio: {r.servicioTitulo}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}
