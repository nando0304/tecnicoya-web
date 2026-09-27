import { useExperiencias, useRemoveExperiencia, type ExperienciaLaboral } from '@/entities/experiencia'
import { ExperienciaForm } from '@/features/experiencia-form'
import { formatMesAnio } from '@/shared/lib'
import { Badge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<ExperienciaLaboral>[] = [
  { header: 'Técnico', cell: (e) => <span className="font-medium">{e.tecnicoNombre}</span> },
  {
    header: 'Cargo',
    cell: (e) => (
      <div>
        <p className="font-medium">{e.cargo}</p>
        <p className="text-xs text-muted">{e.empresa}</p>
      </div>
    ),
  },
  {
    header: 'Periodo',
    cell: (e) => `${formatMesAnio(e.fechaInicio)} – ${e.actualidad ? 'Actualidad' : formatMesAnio(e.fechaFin)}`,
    className: 'whitespace-nowrap',
  },
  { header: 'Actual', cell: (e) => (e.actualidad ? <Badge tone="primary">Sí</Badge> : <span className="text-muted">No</span>) },
]

export function ExperienciasPage() {
  const query = useExperiencias()
  const eliminar = useRemoveExperiencia()

  return (
    <CrudPage
      title="Experiencia laboral"
      description="Trayectoria profesional registrada por los técnicos."
      entidad="experiencia"
      femenino
      query={query}
      columns={columnas}
      rowKey={(e) => e.idExperiencia}
      searchText={(e) => `${e.tecnicoNombre} ${e.cargo} ${e.empresa}`}
      searchPlaceholder="Buscar por técnico, cargo o empresa…"
      renderForm={({ item, cerrar }) => <ExperienciaForm experiencia={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(e) => eliminar.mutateAsync(e.idExperiencia)}
      describir={(e) => `“${e.cargo}” de ${e.tecnicoNombre}`}
    />
  )
}
