import { useState } from 'react'
import { EstadoSuscripcion, useRemoveSuscripcion, useSuscripciones, type Suscripcion } from '@/entities/suscripcion'
import { SuscripcionForm } from '@/features/suscripcion-form'
import { formatFecha } from '@/shared/lib'
import { FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Suscripcion>[] = [
  { header: 'Técnico', cell: (s) => <span className="font-medium">{s.tecnicoNombre}</span> },
  { header: 'Plan', cell: (s) => s.nombrePlan },
  { header: 'Vigencia', cell: (s) => `${formatFecha(s.fechaInicio)} – ${formatFecha(s.fechaFin)}`, className: 'whitespace-nowrap' },
  { header: 'Estado', cell: (s) => <StatusBadge def={EstadoSuscripcion} value={s.estadoSuscripcion} /> },
  { header: 'Cancelación', cell: (s) => (s.fechaCancelacion ? formatFecha(s.fechaCancelacion) : <span className="text-muted">—</span>) },
]

export function SuscripcionesPage() {
  const query = useSuscripciones()
  const eliminar = useRemoveSuscripcion()
  const [estado, setEstado] = useState<EstadoSuscripcion | ''>('')

  return (
    <CrudPage
      title="Suscripciones"
      description="Planes contratados por cada técnico y su vigencia."
      entidad="suscripción"
      femenino
      query={query}
      columns={columnas}
      rowKey={(s) => s.idSuscripcion}
      searchText={(s) => `${s.tecnicoNombre} ${s.nombrePlan}`}
      searchPlaceholder="Buscar por técnico o plan…"
      filter={estado ? (s) => s.estadoSuscripcion === estado : undefined}
      toolbar={<FilterSelect label="Estado" value={estado} onChange={setEstado} options={EstadoSuscripcion.options} />}
      renderForm={({ item, cerrar }) => <SuscripcionForm suscripcion={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(s) => eliminar.mutateAsync(s.idSuscripcion)}
      describir={(s) => `la suscripción ${s.nombrePlan} de ${s.tecnicoNombre}`}
    />
  )
}
