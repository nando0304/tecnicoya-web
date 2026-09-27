import { useState } from 'react'
import { EstadoServicio, Prioridad, useRemoveServicio, useServicios, type Servicio } from '@/entities/servicio'
import { ServicioForm } from '@/features/servicio-form'
import { formatFecha, formatFechaHora } from '@/shared/lib'
import { useBusquedaInicial } from '@/shared/lib/use-busqueda'
import { FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Servicio>[] = [
  {
    header: 'Servicio',
    cell: (s) => (
      <div className="min-w-48">
        <p className="font-medium">{s.titulo}</p>
        <p className="text-xs text-muted">
          #{s.idServicio} · {formatFecha(s.fechaSolicitud)}
        </p>
      </div>
    ),
  },
  { header: 'Cliente', cell: (s) => s.clienteNombre },
  { header: 'Técnico', cell: (s) => s.tecnicoNombre ?? <span className="text-muted">Sin asignar</span> },
  { header: 'Prioridad', cell: (s) => <StatusBadge def={Prioridad} value={s.prioridad} /> },
  { header: 'Estado', cell: (s) => <StatusBadge def={EstadoServicio} value={s.estadoServicio} /> },
  {
    header: 'Fecha del servicio',
    cell: (s) => (s.fechaServicio ? formatFechaHora(s.fechaServicio) : <span className="text-muted">Por coordinar</span>),
    className: 'whitespace-nowrap',
  },
]

export function ServiciosPage() {
  const query = useServicios()
  const eliminar = useRemoveServicio()
  const busqueda = useBusquedaInicial()
  const [estado, setEstado] = useState<EstadoServicio | ''>('')

  return (
    <CrudPage
      key={busqueda}
      title="Servicios"
      description="Solicitudes de los clientes, su técnico asignado y su avance."
      entidad="servicio"
      query={query}
      columns={columnas}
      rowKey={(s) => s.idServicio}
      searchText={(s) => `${s.idServicio} ${s.titulo} ${s.clienteNombre} ${s.tecnicoNombre ?? ''}`}
      searchPlaceholder="Buscar por título, cliente o técnico…"
      initialSearch={busqueda}
      filter={estado ? (s) => s.estadoServicio === estado : undefined}
      toolbar={<FilterSelect label="Estado" value={estado} onChange={setEstado} options={EstadoServicio.options} />}
      renderForm={({ item, cerrar }) => <ServicioForm servicio={item} modo="admin" onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(s) => eliminar.mutateAsync(s.idServicio)}
      describir={(s) => `el servicio “${s.titulo}”`}
      modalSize="lg"
    />
  )
}
