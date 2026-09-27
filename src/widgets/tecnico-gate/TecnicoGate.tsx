import { Link } from '@tanstack/react-router'
import { Clock, ShieldX, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useUsuarioActual } from '@/entities/session'
import { useTecnicoDeUsuario, type Tecnico } from '@/entities/tecnico'
import { TecnicoForm } from '@/features/tecnico-form'
import { ErrorState, LoadingState, PageHeader, Panel } from '@/shared/ui'

/**
 * Resuelve el perfil técnico del usuario de la sesión. Si aún no lo tiene
 * (p. ej. falló su creación al registrarse), le pide completarlo antes de continuar.
 */
export function TecnicoGate({ children }: { children: (tecnico: Tecnico) => ReactNode }) {
  const usuario = useUsuarioActual()
  const { tecnico, isLoading, error, refetch } = useTecnicoDeUsuario(usuario.idUsuario)

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />
  if (!tecnico) {
    return (
      <>
        <PageHeader
          title="Completa tu perfil profesional"
          description="Antes de recibir servicios, cuéntales a los clientes en qué te especializas."
        />
        <Panel className="max-w-2xl">
          <div className="mb-5 flex items-start gap-3 rounded-box bg-primary-soft p-4 text-sm">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>Tu perfil quedará pendiente de verificación. Mientras tanto, puedes cargar tus evidencias y tu disponibilidad.</p>
          </div>
          <TecnicoForm usuarioId={usuario.idUsuario} onSuccess={() => undefined} submitLabel="Crear mi perfil" />
        </Panel>
      </>
    )
  }
  return <>{children(tecnico)}</>
}

/** Aviso del estado de verificación: sin verificar, el técnico no puede tomar servicios. */
export function VerificacionAviso({ tecnico }: { tecnico: Tecnico }) {
  if (tecnico.estadoVerificacion === 'VERIFICADO') return null
  const rechazado = tecnico.estadoVerificacion === 'RECHAZADO'
  return (
    <div
      role="status"
      className={
        rechazado
          ? 'mb-6 flex flex-col gap-3 rounded-box border border-error/30 bg-error/5 p-4 sm:flex-row sm:items-center'
          : 'mb-6 flex flex-col gap-3 rounded-box border border-warning/50 bg-warning/10 p-4 sm:flex-row sm:items-center'
      }
    >
      {rechazado ? <ShieldX className="size-6 shrink-0 text-error" /> : <Clock className="size-6 shrink-0 text-secondary" />}
      <div className="flex-1 text-sm">
        <p className="font-semibold">{rechazado ? 'Tu verificación fue rechazada' : 'Tu perfil está en revisión'}</p>
        <p className="text-muted">
          {rechazado
            ? 'Revisa y actualiza tus evidencias para que el equipo vuelva a evaluar tu perfil.'
            : 'Podrás aceptar servicios cuando un administrador verifique tus evidencias.'}
        </p>
      </div>
      <Link to="/tecnico/evidencias" className="btn btn-sm btn-outline shrink-0">
        Ver mis evidencias
      </Link>
    </div>
  )
}
