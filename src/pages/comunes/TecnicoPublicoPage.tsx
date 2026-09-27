import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Info, Send, UserX } from 'lucide-react'
import { useState } from 'react'
import { useUsuarioActual } from '@/entities/session'
import { useTecnicos } from '@/entities/tecnico'
import type { TipoUsuario } from '@/entities/usuario'
import { EmptyState, ErrorState, LoadingState, Panel } from '@/shared/ui'
import { SolicitarServicioModal } from '@/widgets/tecnico-card'
import { DisponibilidadSemanal, EvidenciasLista, ExperienciaLista, PerfilHeader, ResenasLista } from '@/widgets/tecnico-perfil'

const VOLVER = {
  CLIENTE: { to: '/cliente/tecnicos', label: 'Volver a técnicos' },
  TECNICO: { to: '/tecnico/perfil', label: 'Volver a mi perfil' },
  ADMINISTRADOR: { to: '/admin/tecnicos', label: 'Volver a técnicos' },
} as const satisfies Record<TipoUsuario, { to: string; label: string }>

/** Perfil del técnico tal como lo ven los clientes. */
export function TecnicoPublicoPage() {
  const usuario = useUsuarioActual()
  const { tecnicoId } = useParams({ strict: false }) as { tecnicoId?: string }
  const { data, isLoading, error, refetch } = useTecnicos()
  const [solicitar, setSolicitar] = useState(false)

  const tecnico = data?.find((t) => t.idTecnico === Number(tecnicoId))
  const volver = VOLVER[usuario.tipoUsuario]

  const enlaceVolver = (
    <Link to={volver.to} className="btn btn-ghost btn-sm mb-4 -ml-2 text-muted">
      <ArrowLeft className="size-4" /> {volver.label}
    </Link>
  )

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!tecnico) {
    return (
      <>
        {enlaceVolver}
        <div className="rounded-box border border-base-300 bg-base-100">
          <EmptyState icon={UserX} title="Técnico no encontrado" description="El perfil que buscas no existe o fue eliminado." />
        </div>
      </>
    )
  }

  const esPropio = tecnico.usuarioId === usuario.idUsuario
  const puedeSolicitar = usuario.tipoUsuario === 'CLIENTE' && tecnico.estadoVerificacion === 'VERIFICADO'

  return (
    <>
      {enlaceVolver}

      {esPropio && (
        <div className="mb-6 flex items-center gap-3 rounded-box border border-primary/15 bg-primary-soft p-4 text-sm">
          <Info className="size-5 shrink-0 text-primary" />
          Así ven tu perfil los clientes. Los documentos personales se muestran solo como “Verificado”.
        </div>
      )}

      <PerfilHeader
        tecnico={tecnico}
        acciones={
          puedeSolicitar && (
            <button type="button" className="btn btn-primary shadow-md shadow-primary/25" onClick={() => setSolicitar(true)}>
              <Send className="size-4" /> Solicitar servicio
            </button>
          )
        }
      />

      <div className="mt-6 space-y-6">
        {tecnico.descripcion && (
          <Panel title="Sobre mí">
            <p className="whitespace-pre-line leading-relaxed text-base-content/90">{tecnico.descripcion}</p>
          </Panel>
        )}
        <DisponibilidadSemanal tecnicoId={tecnico.idTecnico} />
        <div className="grid gap-6 xl:grid-cols-2">
          <ExperienciaLista tecnicoId={tecnico.idTecnico} />
          <EvidenciasLista tecnicoId={tecnico.idTecnico} publico />
        </div>
        <ResenasLista tecnicoId={tecnico.idTecnico} />
      </div>

      {puedeSolicitar && <SolicitarServicioModal open={solicitar} onClose={() => setSolicitar(false)} tecnico={tecnico} />}
    </>
  )
}
