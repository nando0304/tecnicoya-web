import { useState } from 'react'
import {
  EstadoUsuario,
  nombreCompleto,
  nombreCorto,
  TipoUsuario,
  useRemoveUsuario,
  useUsuarios,
  type Usuario,
} from '@/entities/usuario'
import { UsuarioForm } from '@/features/usuario-form'
import { formatFecha } from '@/shared/lib'
import { Avatar, FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<Usuario>[] = [
  {
    header: 'Usuario',
    cell: (u) => (
      <div className="flex items-center gap-3">
        <Avatar nombre={nombreCorto(u)} size="sm" />
        <div className="min-w-0">
          <p className="font-medium">{nombreCompleto(u)}</p>
          <p className="text-xs text-muted">{u.correo}</p>
        </div>
      </div>
    ),
  },
  { header: 'Teléfono', cell: (u) => u.telefono ?? <span className="text-muted">—</span> },
  { header: 'Tipo', cell: (u) => <StatusBadge def={TipoUsuario} value={u.tipoUsuario} /> },
  { header: 'Estado', cell: (u) => <StatusBadge def={EstadoUsuario} value={u.estado} /> },
  { header: 'Registro', cell: (u) => formatFecha(u.fechaRegistro), className: 'whitespace-nowrap' },
]

export function UsuariosPage() {
  const query = useUsuarios()
  const eliminar = useRemoveUsuario()
  const [tipo, setTipo] = useState<TipoUsuario | ''>('')

  return (
    <CrudPage
      title="Usuarios"
      description="Clientes, técnicos y administradores registrados en la plataforma."
      entidad="usuario"
      query={query}
      columns={columnas}
      rowKey={(u) => u.idUsuario}
      searchText={(u) => `${nombreCompleto(u)} ${u.correo} ${u.telefono ?? ''}`}
      searchPlaceholder="Buscar por nombre o correo…"
      filter={tipo ? (u) => u.tipoUsuario === tipo : undefined}
      toolbar={<FilterSelect label="Tipo" value={tipo} onChange={setTipo} options={TipoUsuario.options} />}
      renderForm={({ item, cerrar }) => <UsuarioForm usuario={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(u) => eliminar.mutateAsync(u.idUsuario)}
      describir={nombreCompleto}
    />
  )
}
