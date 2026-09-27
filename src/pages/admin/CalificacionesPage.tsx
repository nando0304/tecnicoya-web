import { useCalificaciones, useRemoveCalificacion, type Calificacion } from '@/entities/calificacion'
import { CalificacionForm } from '@/features/calificacion-form'
import { formatFecha } from '@/shared/lib'
import { Stars, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Calificacion>[] = [
  {
    header: 'Servicio',
    cell: (c) => (
      <div>
        <p className="font-medium">{c.servicioTitulo}</p>
        <p className="text-xs text-muted">#{c.servicioId}</p>
      </div>
    ),
  },
  { header: 'Técnico', cell: (c) => c.tecnicoNombre ?? <span className="text-muted">—</span> },
  { header: 'Puntuación', cell: (c) => <Stars value={c.puntuacion} /> },
  { header: 'Comentario', cell: (c) => <p className="line-clamp-2 max-w-sm text-sm">{c.comentario ?? '—'}</p> },
  { header: 'Fecha', cell: (c) => formatFecha(c.fechaCalificacion), className: 'whitespace-nowrap' },
]

export function CalificacionesPage() {
  const query = useCalificaciones()
  const eliminar = useRemoveCalificacion()

  return (
    <CrudPage
      title="Calificaciones"
      description="Opiniones de los clientes sobre los servicios finalizados."
      entidad="calificación"
      femenino
      query={query}
      columns={columnas}
      rowKey={(c) => c.idCalificacion}
      searchText={(c) => `${c.servicioTitulo} ${c.tecnicoNombre ?? ''} ${c.comentario ?? ''}`}
      searchPlaceholder="Buscar por servicio, técnico o comentario…"
      renderForm={({ item, cerrar }) => <CalificacionForm calificacion={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(c) => eliminar.mutateAsync(c.idCalificacion)}
      describir={(c) => `la calificación del servicio “${c.servicioTitulo}”`}
    />
  )
}
