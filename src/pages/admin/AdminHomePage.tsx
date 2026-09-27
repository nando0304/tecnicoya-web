import { Link } from '@tanstack/react-router'
import { BadgeCheck, Check, ClipboardList, Inbox, Users, Wallet, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { TipoEvidencia, toEvidenciaRequest, useEvidencias, useUpdateEvidencia } from '@/entities/evidencia'
import { toEvidenciaPagoRequest, useEvidenciasPago, useUpdateEvidenciaPago } from '@/entities/evidencia-pago'
import { toPagoSuscripcionRequest, usePagosSuscripcion, useUpdatePagoSuscripcion } from '@/entities/pago-suscripcion'
import { EstadoServicio, Prioridad, useServicios, type Servicio } from '@/entities/servicio'
import { useUsuarioActual } from '@/entities/session'
import { toSuscripcionRequest, useSuscripciones, useUpdateSuscripcion } from '@/entities/suscripcion'
import { toTecnicoRequest, useTecnicos, useUpdateTecnico } from '@/entities/tecnico'
import { useUsuarios } from '@/entities/usuario'
import { cn, formatFecha, formatFechaHora, formatMoneda, type Tone } from '@/shared/lib'
import { MetodoPago } from '@/shared/model/enums'
import {
  Avatar,
  DataTable,
  EmptyState,
  EnlaceArchivo,
  ejecutar,
  LoadingState,
  PageHeader,
  Panel,
  SectionHeader,
  StatCard,
  StatusBadge,
  Tabs,
  type Column,
} from '@/shared/ui'

const BARRAS: Record<Tone, string> = {
  neutral: 'bg-base-300',
  primary: 'bg-primary',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
}

const columnasRecientes: Column<Servicio>[] = [
  {
    header: 'Servicio',
    cell: (s) => (
      <div>
        <p className="font-medium">{s.titulo}</p>
        <p className="text-xs text-muted">{s.clienteNombre}</p>
      </div>
    ),
  },
  { header: 'Técnico', cell: (s) => s.tecnicoNombre ?? <span className="text-muted">Sin asignar</span> },
  { header: 'Prioridad', cell: (s) => <StatusBadge def={Prioridad} value={s.prioridad} /> },
  { header: 'Estado', cell: (s) => <StatusBadge def={EstadoServicio} value={s.estadoServicio} /> },
  { header: 'Solicitud', cell: (s) => formatFechaHora(s.fechaSolicitud), className: 'whitespace-nowrap' },
]

export function AdminHomePage() {
  const usuario = useUsuarioActual()
  const usuarios = useUsuarios()
  const tecnicos = useTecnicos()
  const servicios = useServicios()
  const pagos = usePagosSuscripcion()

  const datos = useMemo(() => {
    const listaUsuarios = usuarios.data ?? []
    const listaServicios = servicios.data ?? []
    return {
      clientes: listaUsuarios.filter((u) => u.tipoUsuario === 'CLIENTE').length,
      tecnicosUsuarios: listaUsuarios.filter((u) => u.tipoUsuario === 'TECNICO').length,
      verificados: tecnicos.data?.filter((t) => t.estadoVerificacion === 'VERIFICADO').length ?? 0,
      porVerificar: tecnicos.data?.filter((t) => t.estadoVerificacion === 'PENDIENTE').length ?? 0,
      activos: listaServicios.filter((s) => ['PENDIENTE', 'ASIGNADO', 'EN_PROCESO'].includes(s.estadoServicio)).length,
      finalizados: listaServicios.filter((s) => s.estadoServicio === 'FINALIZADO').length,
      ingresos: pagos.data?.filter((p) => p.estadoPago === 'APROBADO').reduce((suma, p) => suma + p.montoPago, 0) ?? 0,
      porEstado: EstadoServicio.values.map((estado) => ({
        estado,
        cantidad: listaServicios.filter((s) => s.estadoServicio === estado).length,
      })),
      recientes: [...listaServicios].sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud)).slice(0, 5),
      totalServicios: listaServicios.length,
    }
  }, [usuarios.data, tecnicos.data, servicios.data, pagos.data])

  const cargando = usuarios.isLoading || tecnicos.isLoading || servicios.isLoading

  return (
    <>
      <PageHeader
        title={`Hola, ${usuario.nombres.split(' ')[0]}`}
        description="Resumen de la actividad de TécnicoYa y tareas pendientes de revisión."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Usuarios registrados"
          value={cargando ? '—' : (usuarios.data?.length ?? 0)}
          icon={Users}
          hint={`${datos.clientes} clientes · ${datos.tecnicosUsuarios} técnicos`}
        />
        <StatCard label="Técnicos verificados" value={cargando ? '—' : datos.verificados} icon={BadgeCheck} tone="success" hint={`${datos.porVerificar} por verificar`} />
        <StatCard label="Servicios activos" value={cargando ? '—' : datos.activos} icon={ClipboardList} tone="info" hint={`${datos.finalizados} finalizados`} />
        <StatCard label="Ingresos por suscripciones" value={formatMoneda(datos.ingresos)} icon={Wallet} tone="warning" hint="Pagos aprobados" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PendientesRevision />

        <Panel title="Servicios por estado" description={`${datos.totalServicios} servicios en total`}>
          <ul className="space-y-4">
            {datos.porEstado.map(({ estado, cantidad }) => {
              const porcentaje = datos.totalServicios ? Math.round((cantidad / datos.totalServicios) * 100) : 0
              return (
                <li key={estado}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{EstadoServicio.label(estado)}</span>
                    <span className="text-muted">
                      {cantidad} · {porcentaje}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-base-200">
                    <div className={cn('h-full rounded-full transition-all', BARRAS[EstadoServicio.tone(estado)])} style={{ width: `${porcentaje}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <SectionHeader
          title="Servicios recientes"
          actions={
            <Link to="/admin/servicios" className="text-sm font-medium text-primary hover:underline">
            Ver todos
          </Link>
          }
        />
        <DataTable
          rows={datos.recientes}
          columns={columnasRecientes}
          rowKey={(s) => s.idServicio}
          isLoading={servicios.isLoading}
          error={servicios.error}
          emptyTitle="Aún no hay servicios"
          pageSize={5}
        />
      </div>
    </>
  )
}

type Pestana = 'tecnicos' | 'evidencias' | 'comprobantes' | 'suscripciones'

/** Bandeja de aprobación: lo que espera una decisión del administrador. */
function PendientesRevision() {
  const tecnicos = useTecnicos()
  const evidencias = useEvidencias()
  const comprobantes = useEvidenciasPago()
  const suscripciones = useSuscripciones()
  const pagos = usePagosSuscripcion()
  const actualizarTecnico = useUpdateTecnico()
  const actualizarEvidencia = useUpdateEvidencia()
  const actualizarComprobante = useUpdateEvidenciaPago()
  const actualizarSuscripcion = useUpdateSuscripcion()
  const actualizarPago = useUpdatePagoSuscripcion()

  const [pestana, setPestana] = useState<Pestana>('tecnicos')
  const [procesando, setProcesando] = useState<string | null>(null)

  const pendientes = {
    tecnicos: tecnicos.data?.filter((t) => t.estadoVerificacion === 'PENDIENTE') ?? [],
    evidencias: evidencias.data?.filter((e) => e.estadoValidacion === 'PENDIENTE') ?? [],
    comprobantes: comprobantes.data?.filter((c) => c.estadoValidacion === 'PENDIENTE') ?? [],
    suscripciones: suscripciones.data?.filter((s) => s.estadoSuscripcion === 'PENDIENTE') ?? [],
  }
  const cargando = tecnicos.isLoading || evidencias.isLoading || comprobantes.isLoading || suscripciones.isLoading

  const procesar = async (clave: string, accion: () => Promise<unknown>, exito: string) => {
    setProcesando(clave)
    await ejecutar(accion, { exito })
    setProcesando(null)
  }

  const acciones = (clave: string, aprobar: () => Promise<unknown>, rechazar: () => Promise<unknown>, textos: [string, string]) => (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        className="btn btn-success btn-soft btn-sm"
        disabled={procesando !== null}
        onClick={() => procesar(clave, aprobar, textos[0])}
      >
        {procesando === clave ? <span className="loading loading-spinner loading-xs" /> : <Check className="size-4" />}
        Aprobar
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm text-error hover:bg-error/10"
        disabled={procesando !== null}
        onClick={() => procesar(clave, rechazar, textos[1])}
      >
        <X className="size-4" /> Rechazar
      </button>
    </div>
  )

  let contenido: ReactNode
  if (cargando) contenido = <LoadingState />
  else if (pendientes[pestana].length === 0)
    contenido = <EmptyState icon={Inbox} title="Nada pendiente por aquí" description="Cuando haya nuevos registros por revisar aparecerán en esta bandeja." />
  else if (pestana === 'tecnicos')
    contenido = (
      <Lista>
        {pendientes.tecnicos.map((t) => (
          <Fila key={t.idTecnico}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar nombre={t.nombreCompleto} size="sm" />
              <div className="min-w-0">
                <Link to="/tecnicos/$tecnicoId" params={{ tecnicoId: String(t.idTecnico) }} className="font-medium hover:text-primary">
                  {t.nombreCompleto}
                </Link>
                <p className="truncate text-xs text-muted">
                  {t.especialidad} · {evidencias.data?.filter((e) => e.tecnicoId === t.idTecnico).length ?? 0} evidencias
                </p>
              </div>
            </div>
            {acciones(
              `t${t.idTecnico}`,
              () => actualizarTecnico.mutateAsync({ id: t.idTecnico, body: toTecnicoRequest(t, { estadoVerificacion: 'VERIFICADO' }) }),
              () => actualizarTecnico.mutateAsync({ id: t.idTecnico, body: toTecnicoRequest(t, { estadoVerificacion: 'RECHAZADO' }) }),
              [`${t.nombreCompleto} fue verificado`, `Se rechazó la verificación de ${t.nombreCompleto}`],
            )}
          </Fila>
        ))}
      </Lista>
    )
  else if (pestana === 'evidencias')
    contenido = (
      <Lista>
        {pendientes.evidencias.map((e) => (
          <Fila key={e.idEvidencia}>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {TipoEvidencia.label(e.tipoEvidencia)} · <span className="font-normal text-muted">{e.tecnicoNombre}</span>
              </p>
              <p className="truncate text-xs text-muted">{e.descripcion ?? 'Sin descripción'}</p>
              <div className="mt-1">
                <EnlaceArchivo url={e.urlArchivo} texto="Revisar archivo" />
              </div>
            </div>
            {acciones(
              `e${e.idEvidencia}`,
              () => actualizarEvidencia.mutateAsync({ id: e.idEvidencia, body: toEvidenciaRequest(e, { estadoValidacion: 'APROBADO' }) }),
              () => actualizarEvidencia.mutateAsync({ id: e.idEvidencia, body: toEvidenciaRequest(e, { estadoValidacion: 'RECHAZADO' }) }),
              ['Evidencia aprobada', 'Evidencia rechazada'],
            )}
          </Fila>
        ))}
      </Lista>
    )
  else if (pestana === 'comprobantes')
    contenido = (
      <Lista>
        {pendientes.comprobantes.map((c) => (
          <Fila key={c.idEvidenciaPago}>
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {formatMoneda(c.monto)} · <span className="font-normal text-muted">{c.servicioTitulo}</span>
              </p>
              <p className="text-xs text-muted">
                {MetodoPago.label(c.metodoPago)} · {formatFechaHora(c.fechaPago)}
              </p>
              <div className="mt-1">
                <EnlaceArchivo url={c.archivoEvidencia} texto="Ver comprobante" />
              </div>
            </div>
            {acciones(
              `c${c.idEvidenciaPago}`,
              () => actualizarComprobante.mutateAsync({ id: c.idEvidenciaPago, body: toEvidenciaPagoRequest(c, { estadoValidacion: 'APROBADO' }) }),
              () => actualizarComprobante.mutateAsync({ id: c.idEvidenciaPago, body: toEvidenciaPagoRequest(c, { estadoValidacion: 'RECHAZADO' }) }),
              ['Comprobante validado', 'Comprobante rechazado'],
            )}
          </Fila>
        ))}
      </Lista>
    )
  else
    contenido = (
      <Lista>
        {pendientes.suscripciones.map((s) => {
          const pago = pagos.data?.find((p) => p.suscripcionId === s.idSuscripcion && p.estadoPago === 'PENDIENTE')
          return (
            <Fila key={s.idSuscripcion}>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  Plan {s.nombrePlan} · <span className="font-normal text-muted">{s.tecnicoNombre}</span>
                </p>
                <p className="text-xs text-muted">
                  {formatFecha(s.fechaInicio)} – {formatFecha(s.fechaFin)}
                  {pago ? ` · Pago pendiente de ${formatMoneda(pago.montoPago)} (${MetodoPago.label(pago.metodoPago)})` : ' · Sin pago pendiente'}
                </p>
              </div>
              {acciones(
                `s${s.idSuscripcion}`,
                // Primero se activa: si el técnico ya tiene otra activa, la API lo impide y el pago no se toca
                async () => {
                  await actualizarSuscripcion.mutateAsync({ id: s.idSuscripcion, body: toSuscripcionRequest(s, { estadoSuscripcion: 'ACTIVA' }) })
                  if (pago) await actualizarPago.mutateAsync({ id: pago.idPagoSuscripcion, body: toPagoSuscripcionRequest(pago, { estadoPago: 'APROBADO' }) })
                },
                async () => {
                  if (pago) await actualizarPago.mutateAsync({ id: pago.idPagoSuscripcion, body: toPagoSuscripcionRequest(pago, { estadoPago: 'RECHAZADO' }) })
                  await actualizarSuscripcion.mutateAsync({ id: s.idSuscripcion, body: toSuscripcionRequest(s, { estadoSuscripcion: 'CANCELADA' }) })
                },
                ['Suscripción activada', 'Suscripción rechazada'],
              )}
            </Fila>
          )
        })}
      </Lista>
    )

  return (
    <Panel title="Pendientes de revisión" description="Aprueba o rechaza lo que enviaron técnicos y clientes.">
      <Tabs
        value={pestana}
        onChange={setPestana}
        className="mb-2"
        tabs={[
          { id: 'tecnicos', label: `Técnicos (${pendientes.tecnicos.length})` },
          { id: 'evidencias', label: `Evidencias (${pendientes.evidencias.length})` },
          { id: 'comprobantes', label: `Comprobantes (${pendientes.comprobantes.length})` },
          { id: 'suscripciones', label: `Suscripciones (${pendientes.suscripciones.length})` },
        ]}
      />
      {contenido}
    </Panel>
  )
}

const Lista = ({ children }: { children: ReactNode }) => <ul className="divide-y divide-base-300">{children}</ul>

const Fila = ({ children }: { children: ReactNode }) => (
  <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">{children}</li>
)
