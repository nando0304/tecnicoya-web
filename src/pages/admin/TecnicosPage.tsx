import { Link } from '@tanstack/react-router'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { EstadoVerificacion, useRemoveTecnico, useTecnicos, type Tecnico } from '@/entities/tecnico'
import { TecnicoForm } from '@/features/tecnico-form'
import { Avatar, FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Tecnico>[] = [
  {
    header: 'Técnico',
    cell: (t) => (
      <div className="flex items-center gap-3">
        <Avatar nombre={t.nombreCompleto} size="sm" />
        <div className="min-w-0">
          <p className="font-medium">{t.nombreCompleto}</p>
          <p className="text-xs text-muted">{t.correo}</p>
        </div>
      </div>
    ),
  },
  { header: 'Especialidad', cell: (t) => t.especialidad },
  { header: 'Teléfono', cell: (t) => t.telefono ?? <span className="text-muted">—</span> },
  { header: 'Verificación', cell: (t) => <StatusBadge def={EstadoVerificacion} value={t.estadoVerificacion} /> },
]

export function TecnicosPage() {
  const query = useTecnicos()
  const eliminar = useRemoveTecnico()
  const [estado, setEstado] = useState<EstadoVerificacion | ''>('')

  return (
    <CrudPage
      title="Técnicos"
      description="Perfiles profesionales de los técnicos y su estado de verificación."
      entidad="técnico"
      query={query}
      columns={columnas}
      rowKey={(t) => t.idTecnico}
      searchText={(t) => `${t.nombreCompleto} ${t.correo} ${t.especialidad}`}
      searchPlaceholder="Buscar por nombre o especialidad…"
      filter={estado ? (t) => t.estadoVerificacion === estado : undefined}
      toolbar={<FilterSelect label="Verificación" value={estado} onChange={setEstado} options={EstadoVerificacion.options} />}
      rowActions={(t) => (
        <Link
          to="/tecnicos/$tecnicoId"
          params={{ tecnicoId: String(t.idTecnico) }}
          className="btn btn-square btn-ghost btn-sm"
          aria-label={`Ver perfil público de ${t.nombreCompleto}`}
          title="Ver perfil público"
        >
          <Eye className="size-4" />
        </Link>
      )}
      renderForm={({ item, cerrar }) => <TecnicoForm tecnico={item} puedeVerificar onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(t) => eliminar.mutateAsync(t.idTecnico)}
      describir={(t) => `el perfil técnico de ${t.nombreCompleto}`}
    />
  )
}
