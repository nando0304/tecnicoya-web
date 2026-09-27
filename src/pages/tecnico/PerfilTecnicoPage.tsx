import { Link } from '@tanstack/react-router'
import { Eye, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useUsuarioActual } from '@/entities/session'
import type { Tecnico } from '@/entities/tecnico'
import type { Usuario } from '@/entities/usuario'
import { DatosPersonalesForm } from '@/features/cuenta'
import { TecnicoForm } from '@/features/tecnico-form'
import { formatFecha } from '@/shared/lib'
import { PageHeader, Panel, ReadOnlyField, Tabs } from '@/shared/ui'
import { TecnicoGate } from '@/widgets/tecnico-gate'
import { DisponibilidadSemanal, EvidenciasLista, ExperienciaLista, PerfilHeader } from '@/widgets/tecnico-perfil'

export function PerfilTecnicoPage() {
  return <TecnicoGate>{(tecnico) => <PerfilTecnico tecnico={tecnico} />}</TecnicoGate>
}

type Pestana = 'personal' | 'especialidad' | 'experiencia' | 'disponibilidad' | 'evidencias'

const PESTANAS: { id: Pestana; label: string }[] = [
  { id: 'personal', label: 'Información personal' },
  { id: 'especialidad', label: 'Especialidad' },
  { id: 'experiencia', label: 'Experiencia' },
  { id: 'disponibilidad', label: 'Disponibilidad' },
  { id: 'evidencias', label: 'Evidencias' },
]

function PerfilTecnico({ tecnico }: { tecnico: Tecnico }) {
  const usuario = useUsuarioActual()
  const [pestana, setPestana] = useState<Pestana>('personal')

  return (
    <>
      <PageHeader
        title="Mi perfil como técnico"
        description="Administra tu información profesional para que los clientes puedan conocerte y contratar tus servicios."
        actions={
          <Link
            to="/tecnicos/$tecnicoId"
            params={{ tecnicoId: String(tecnico.idTecnico) }}
            className="btn btn-primary shadow-md shadow-primary/25"
          >
            <Eye className="size-4" /> Ver mi perfil público
          </Link>
        }
      />

      <PerfilHeader tecnico={tecnico} />

      <Tabs tabs={PESTANAS} value={pestana} onChange={setPestana} className="mb-6 mt-8" />

      <div role="tabpanel">
        {pestana === 'personal' && <DatosPersonales usuario={usuario} />}
        {pestana === 'especialidad' && <Especialidad tecnico={tecnico} />}
        {pestana === 'experiencia' && <ExperienciaLista tecnicoId={tecnico.idTecnico} editable />}
        {pestana === 'disponibilidad' && <DisponibilidadSemanal tecnicoId={tecnico.idTecnico} editable />}
        {pestana === 'evidencias' && <EvidenciasLista tecnicoId={tecnico.idTecnico} editable />}
      </div>
    </>
  )
}

function BotonEditar({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn btn-outline btn-sm border-base-300" onClick={onClick}>
      <Pencil className="size-3.5" /> Editar
    </button>
  )
}

function DatosPersonales({ usuario }: { usuario: Usuario }) {
  const [editando, setEditando] = useState(false)
  return (
    <Panel title="Datos personales" actions={!editando && <BotonEditar onClick={() => setEditando(true)} />}>
      {editando ? (
        <DatosPersonalesForm usuario={usuario} onSuccess={() => setEditando(false)} onCancel={() => setEditando(false)} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <ReadOnlyField label="Nombres" value={usuario.nombres} />
          <ReadOnlyField label="Apellidos" value={usuario.apellidos} />
          <ReadOnlyField label="Correo electrónico" value={usuario.correo} />
          <ReadOnlyField label="Teléfono" value={usuario.telefono} />
          <ReadOnlyField label="Miembro desde" value={formatFecha(usuario.fechaRegistro)} className="sm:col-span-2" />
        </div>
      )}
    </Panel>
  )
}

function Especialidad({ tecnico }: { tecnico: Tecnico }) {
  const [editando, setEditando] = useState(false)
  return (
    <Panel title="Especialidad y descripción profesional" actions={!editando && <BotonEditar onClick={() => setEditando(true)} />}>
      {editando ? (
        <TecnicoForm tecnico={tecnico} onSuccess={() => setEditando(false)} onCancel={() => setEditando(false)} />
      ) : (
        <div className="grid gap-5">
          <ReadOnlyField label="Especialidad" value={tecnico.especialidad} />
          <ReadOnlyField
            label="Descripción profesional"
            value={tecnico.descripcion && <p className="whitespace-pre-line leading-relaxed">{tecnico.descripcion}</p>}
          />
        </div>
      )}
    </Panel>
  )
}
