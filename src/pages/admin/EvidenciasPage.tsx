import { useState } from 'react'
import { TipoEvidencia, useEvidencias, useRemoveEvidencia, type Evidencia } from '@/entities/evidencia'
import { EvidenciaForm } from '@/features/evidencia-form'
import { formatFecha } from '@/shared/lib'
import { EstadoValidacion } from '@/shared/model/enums'
import { EnlaceArchivo, FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Evidencia>[] = [
  { header: 'Técnico', cell: (e) => <span className="font-medium">{e.tecnicoNombre}</span> },
  { header: 'Tipo', cell: (e) => <StatusBadge def={TipoEvidencia} value={e.tipoEvidencia} /> },
  { header: 'Descripción', cell: (e) => <p className="line-clamp-2 max-w-xs text-sm">{e.descripcion ?? '—'}</p> },
  { header: 'Archivo', cell: (e) => <EnlaceArchivo url={e.urlArchivo} /> },
  { header: 'Validación', cell: (e) => <StatusBadge def={EstadoValidacion} value={e.estadoValidacion} /> },
  { header: 'Carga', cell: (e) => formatFecha(e.fechaCarga), className: 'whitespace-nowrap' },
]

export function EvidenciasPage() {
  const query = useEvidencias()
  const eliminar = useRemoveEvidencia()
  const [estado, setEstado] = useState<EstadoValidacion | ''>('')

  return (
    <CrudPage
      title="Evidencias"
      description="Documentos que respaldan a cada técnico. Apruébalos para verificar su perfil."
      entidad="evidencia"
      femenino
      query={query}
      columns={columnas}
      rowKey={(e) => e.idEvidencia}
      searchText={(e) => `${e.tecnicoNombre} ${TipoEvidencia.label(e.tipoEvidencia)} ${e.descripcion ?? ''}`}
      searchPlaceholder="Buscar por técnico o tipo…"
      filter={estado ? (e) => e.estadoValidacion === estado : undefined}
      toolbar={<FilterSelect label="Validación" value={estado} onChange={setEstado} options={EstadoValidacion.options} />}
      renderForm={({ item, cerrar }) => <EvidenciaForm evidencia={item} puedeValidar onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(e) => eliminar.mutateAsync(e.idEvidencia)}
      describir={(e) => `la evidencia “${TipoEvidencia.label(e.tipoEvidencia)}” de ${e.tecnicoNombre}`}
    />
  )
}
