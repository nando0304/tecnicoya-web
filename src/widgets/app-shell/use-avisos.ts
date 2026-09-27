import type { LinkProps } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useCalificaciones } from '@/entities/calificacion'
import { useEvidencias } from '@/entities/evidencia'
import { useEvidenciasPago } from '@/entities/evidencia-pago'
import { useServicios } from '@/entities/servicio'
import { useSuscripciones } from '@/entities/suscripcion'
import { useTecnicos } from '@/entities/tecnico'
import type { Usuario } from '@/entities/usuario'

export interface Aviso {
  label: string
  cantidad: number
  to: NonNullable<LinkProps['to']>
}

/**
 * Avisos de la campana, calculados con los datos de la API (no hay un recurso de notificaciones):
 * lo que cada rol tiene pendiente de atender.
 */
export function useAvisos(usuario: Usuario): Aviso[] {
  const rol = usuario.tipoUsuario
  const esAdmin = rol === 'ADMINISTRADOR'
  const esTecnico = rol === 'TECNICO'
  const esCliente = rol === 'CLIENTE'

  const tecnicos = useTecnicos({ enabled: esAdmin || esTecnico })
  const evidencias = useEvidencias({ enabled: esAdmin })
  const comprobantes = useEvidenciasPago({ enabled: esAdmin })
  const suscripciones = useSuscripciones({ enabled: esAdmin })
  const servicios = useServicios({ enabled: esTecnico || esCliente })
  const calificaciones = useCalificaciones({ enabled: esCliente })

  return useMemo(() => {
    const avisos: Aviso[] = []
    if (esAdmin) {
      avisos.push(
        {
          label: 'Técnicos por verificar',
          cantidad: tecnicos.data?.filter((t) => t.estadoVerificacion === 'PENDIENTE').length ?? 0,
          to: '/admin',
        },
        {
          label: 'Evidencias por revisar',
          cantidad: evidencias.data?.filter((e) => e.estadoValidacion === 'PENDIENTE').length ?? 0,
          to: '/admin',
        },
        {
          label: 'Comprobantes por validar',
          cantidad: comprobantes.data?.filter((c) => c.estadoValidacion === 'PENDIENTE').length ?? 0,
          to: '/admin',
        },
        {
          label: 'Suscripciones por activar',
          cantidad: suscripciones.data?.filter((s) => s.estadoSuscripcion === 'PENDIENTE').length ?? 0,
          to: '/admin',
        },
      )
    }
    if (esTecnico) {
      const tecnico = tecnicos.data?.find((t) => t.usuarioId === usuario.idUsuario)
      if (tecnico) {
        const mios = servicios.data?.filter((s) => s.tecnicoId === tecnico.idTecnico) ?? []
        avisos.push({
          label: 'Servicios asignados por iniciar',
          cantidad: mios.filter((s) => s.estadoServicio === 'ASIGNADO').length,
          to: '/tecnico/servicios',
        })
        if (tecnico.estadoVerificacion === 'VERIFICADO') {
          avisos.push({
            label: 'Solicitudes disponibles',
            cantidad: servicios.data?.filter((s) => s.estadoServicio === 'PENDIENTE' && s.tecnicoId === null).length ?? 0,
            to: '/tecnico/servicios',
          })
        }
      }
    }
    if (esCliente) {
      const calificados = new Set(calificaciones.data?.map((c) => c.servicioId))
      avisos.push({
        label: 'Servicios por calificar',
        cantidad:
          servicios.data?.filter(
            (s) => s.clienteId === usuario.idUsuario && s.estadoServicio === 'FINALIZADO' && !calificados.has(s.idServicio),
          ).length ?? 0,
        to: '/cliente/solicitudes',
      })
    }
    return avisos.filter((a) => a.cantidad > 0)
  }, [esAdmin, esTecnico, esCliente, usuario.idUsuario, tecnicos.data, evidencias.data, comprobantes.data, suscripciones.data, servicios.data, calificaciones.data])
}
