import { useMemo, useState } from 'react'
import {
  DiaSemana,
  ordenarDisponibilidad,
  useDisponibilidades,
  useRemoveDisponibilidad,
  type Disponibilidad,
} from '@/entities/disponibilidad'
import { DisponibilidadForm } from '@/features/disponibilidad-form'
import { formatHora } from '@/shared/lib'
import { EstadoRegistro } from '@/shared/model/enums'
import { FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Disponibilidad>[] = [
  { header: 'Técnico', cell: (d) => <span className="font-medium">{d.tecnicoNombre}</span> },
  { header: 'Día', cell: (d) => DiaSemana.label(d.diaSemana) },
  { header: 'Horario', cell: (d) => `${formatHora(d.horaInicio)} – ${formatHora(d.horaFin)}`, className: 'whitespace-nowrap' },
  { header: 'Estado', cell: (d) => <StatusBadge def={EstadoRegistro} value={d.estado} /> },
]

export function DisponibilidadesPage() {
  const query = useDisponibilidades()
  const eliminar = useRemoveDisponibilidad()
  const [dia, setDia] = useState<DiaSemana | ''>('')
  const ordenadas = useMemo(
    () => query.data && [...query.data].sort((a, b) => a.tecnicoNombre.localeCompare(b.tecnicoNombre) || ordenarDisponibilidad(a, b)),
    [query.data],
  )

  return (
    <CrudPage
      title="Disponibilidad"
      description="Franjas horarias semanales en las que cada técnico atiende."
      entidad="horario"
      query={{ ...query, data: ordenadas }}
      columns={columnas}
      rowKey={(d) => d.idDisponibilidad}
      searchText={(d) => `${d.tecnicoNombre} ${DiaSemana.label(d.diaSemana)}`}
      searchPlaceholder="Buscar por técnico…"
      filter={dia ? (d) => d.diaSemana === dia : undefined}
      toolbar={<FilterSelect label="Día" value={dia} onChange={setDia} options={DiaSemana.options} />}
      renderForm={({ item, cerrar }) => <DisponibilidadForm disponibilidad={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(d) => eliminar.mutateAsync(d.idDisponibilidad)}
      describir={(d) => `el horario de ${d.tecnicoNombre} (${DiaSemana.label(d.diaSemana)} ${formatHora(d.horaInicio)} – ${formatHora(d.horaFin)})`}
    />
  )
}
