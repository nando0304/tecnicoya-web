import { CalendarRange, CheckCircle2, Clock, Crown, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EstadoPago, usePagosSuscripcion } from '@/entities/pago-suscripcion'
import { usePlanes, type PlanSuscripcion } from '@/entities/plan'
import {
  EstadoSuscripcion,
  toSuscripcionRequest,
  useSuscripciones,
  useUpdateSuscripcion,
  type Suscripcion,
} from '@/entities/suscripcion'
import type { Tecnico } from '@/entities/tecnico'
import { SolicitarPlanForm } from '@/features/solicitar-plan'
import { cn, diasEntre, formatFecha, formatMoneda, parseFecha } from '@/shared/lib'
import {
  ConfirmDialog,
  DataTable,
  ejecutar,
  LoadingState,
  Modal,
  PageHeader,
  Panel,
  SectionHeader,
  StatusBadge,
  type Column,
} from '@/shared/ui'
import { TecnicoGate } from '@/widgets/tecnico-gate'

export function SuscripcionPage() {
  return <TecnicoGate>{(tecnico) => <SuscripcionTecnico tecnico={tecnico} />}</TecnicoGate>
}

function SuscripcionTecnico({ tecnico }: { tecnico: Tecnico }) {
  const planes = usePlanes()
  const suscripciones = useSuscripciones()
  const pagos = usePagosSuscripcion()
  const actualizar = useUpdateSuscripcion()

  const [planElegido, setPlanElegido] = useState<PlanSuscripcion | null>(null)
  const [aCancelar, setACancelar] = useState<Suscripcion | null>(null)
  const [cancelando, setCancelando] = useState(false)

  const { mias, activa, pendiente, masElegido } = useMemo(() => {
    const todas = suscripciones.data ?? []
    const propias = todas.filter((s) => s.tecnicoId === tecnico.idTecnico).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))
    // El plan con más suscripciones en la plataforma se destaca como "Más elegido"
    const conteo = new Map<number, number>()
    for (const s of todas) conteo.set(s.planId, (conteo.get(s.planId) ?? 0) + 1)
    const popular = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    return {
      mias: propias,
      activa: propias.find((s) => s.estadoSuscripcion === 'ACTIVA'),
      pendiente: propias.find((s) => s.estadoSuscripcion === 'PENDIENTE'),
      masElegido: popular,
    }
  }, [suscripciones.data, tecnico.idTecnico])

  const planesActivos = (planes.data ?? []).filter((p) => p.estado === 'ACTIVO').sort((a, b) => a.precioInicial - b.precioInicial)
  const estadoPago = (s: Suscripcion) => pagos.data?.find((p) => p.suscripcionId === s.idSuscripcion)

  const cancelar = async () => {
    if (!aCancelar) return
    setCancelando(true)
    const ok = await ejecutar(
      () => actualizar.mutateAsync({ id: aCancelar.idSuscripcion, body: toSuscripcionRequest(aCancelar, { estadoSuscripcion: 'CANCELADA' }) }),
      { exito: aCancelar.estadoSuscripcion === 'PENDIENTE' ? 'Solicitud anulada' : 'Suscripción cancelada' },
    )
    setCancelando(false)
    if (ok) setACancelar(null)
  }

  const columnas: Column<Suscripcion>[] = [
    { header: 'Plan', cell: (s) => <span className="font-medium">{s.nombrePlan}</span> },
    { header: 'Vigencia', cell: (s) => `${formatFecha(s.fechaInicio)} – ${formatFecha(s.fechaFin)}`, className: 'whitespace-nowrap' },
    { header: 'Estado', cell: (s) => <StatusBadge def={EstadoSuscripcion} value={s.estadoSuscripcion} /> },
    {
      header: 'Pago',
      cell: (s) => {
        const pago = estadoPago(s)
        return pago ? (
          <span className="flex items-center gap-2">
            {formatMoneda(pago.montoPago)} <StatusBadge def={EstadoPago} value={pago.estadoPago} />
          </span>
        ) : (
          <span className="text-muted">—</span>
        )
      },
    },
  ]

  if (suscripciones.isLoading || planes.isLoading) return <LoadingState />

  return (
    <>
      <PageHeader title="Suscripción" description="Elige el plan que mejor se adapta a la cantidad de clientes que atiendes." />

      <div className="grid gap-4 lg:grid-cols-2">
        {activa ? <PlanActual suscripcion={activa} onCancelar={() => setACancelar(activa)} /> : <SinPlan />}
        {pendiente && (
          <div className="flex flex-col gap-3 rounded-box border border-warning/50 bg-warning/10 p-5">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-secondary" />
              <p className="font-semibold">Solicitud del plan {pendiente.nombrePlan} en revisión</p>
            </div>
            <p className="text-sm text-muted">
              Se activará cuando el equipo confirme el pago. Vigencia solicitada: {formatFecha(pendiente.fechaInicio)} –{' '}
              {formatFecha(pendiente.fechaFin)}.
            </p>
            <button type="button" className="btn btn-ghost btn-sm w-fit text-error hover:bg-error/10" onClick={() => setACancelar(pendiente)}>
              Anular solicitud
            </button>
          </div>
        )}
      </div>

      <SectionHeader title="Planes disponibles" className="mt-10" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {planesActivos.map((plan) => {
          const esActual = activa?.planId === plan.idPlan
          const destacado = plan.idPlan === masElegido
          return (
            <article
              key={plan.idPlan}
              className={cn(
                'relative flex flex-col rounded-box border-2 bg-base-100 p-6 shadow-xs',
                destacado ? 'border-primary shadow-lg shadow-primary/10' : 'border-base-300',
              )}
            >
              {destacado && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-content">
                  <Crown className="size-3.5" /> Más elegido
                </span>
              )}
              <h3 className="text-lg font-bold">{plan.nombrePlan}</h3>
              <p className="mt-3">
                <span className="text-4xl font-bold tracking-tight">{plan.precioInicial === 0 ? 'Gratis' : formatMoneda(plan.precioInicial)}</span>
                {plan.precioInicial > 0 && <span className="text-muted"> / mes</span>}
              </p>
              {plan.descripcion && <p className="mt-3 text-sm text-muted">{plan.descripcion}</p>}
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex gap-2">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" /> Hasta {plan.limiteClientes} clientes al mes
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" /> Luego {formatMoneda(plan.precioPosterior)} al mes
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="size-5 shrink-0 text-primary" /> Perfil visible para clientes
                </li>
              </ul>
              <div className="mt-auto pt-6">
                <button
                  type="button"
                  className={cn('btn w-full', destacado ? 'btn-primary' : 'btn-outline border-base-300')}
                  disabled={esActual || !!pendiente}
                  onClick={() => setPlanElegido(plan)}
                >
                  {esActual ? 'Tu plan actual' : pendiente ? 'Tienes una solicitud en curso' : activa ? 'Cambiar a este plan' : 'Elegir plan'}
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <SectionHeader title="Historial" className="mt-10" />
      <DataTable
        rows={mias}
        columns={columnas}
        rowKey={(s) => s.idSuscripcion}
        emptyTitle="Aún no tienes suscripciones"
        emptyDescription="Elige un plan para empezar a recibir clientes."
        pageSize={5}
      />

      <Modal open={planElegido !== null} onClose={() => setPlanElegido(null)} title="Solicitar plan" size="sm">
        {planElegido && (
          <SolicitarPlanForm
            plan={planElegido}
            tecnicoId={tecnico.idTecnico}
            activa={activa}
            onSuccess={() => setPlanElegido(null)}
            onCancel={() => setPlanElegido(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={aCancelar !== null}
        title={aCancelar?.estadoSuscripcion === 'PENDIENTE' ? 'Anular solicitud' : 'Cancelar suscripción'}
        message={
          aCancelar?.estadoSuscripcion === 'PENDIENTE'
            ? `Se anulará tu solicitud del plan ${aCancelar.nombrePlan}.`
            : 'Dejarás de tener un plan activo y podrías dejar de recibir clientes. ¿Deseas continuar?'
        }
        confirmLabel={aCancelar?.estadoSuscripcion === 'PENDIENTE' ? 'Anular' : 'Cancelar suscripción'}
        loading={cancelando}
        onConfirm={cancelar}
        onClose={() => setACancelar(null)}
      />
    </>
  )
}

function PlanActual({ suscripcion, onCancelar }: { suscripcion: Suscripcion; onCancelar: () => void }) {
  const inicio = parseFecha(suscripcion.fechaInicio)
  const fin = parseFecha(suscripcion.fechaFin)
  const hoy = new Date()
  const total = Math.max(1, diasEntre(inicio, fin))
  const restantes = Math.max(0, diasEntre(hoy, fin))
  const avance = Math.min(100, Math.max(0, Math.round(((total - restantes) / total) * 100)))

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Tu plan actual</p>
          <p className="mt-1 text-2xl font-bold">{suscripcion.nombrePlan}</p>
        </div>
        <StatusBadge def={EstadoSuscripcion} value={suscripcion.estadoSuscripcion} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <CalendarRange className="size-4 text-primary" />
        {formatFecha(suscripcion.fechaInicio)} – {formatFecha(suscripcion.fechaFin)}
      </p>
      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs font-medium">
          <span>{restantes === 1 ? 'Queda 1 día' : `Quedan ${restantes} días`}</span>
          <span className="text-muted">{avance}% del periodo</span>
        </div>
        <progress className="progress progress-primary h-2" value={avance} max={100} aria-label="Avance del periodo" />
      </div>
      <button type="button" className="btn btn-ghost btn-sm mt-4 text-error hover:bg-error/10" onClick={onCancelar}>
        Cancelar suscripción
      </button>
    </Panel>
  )
}

function SinPlan() {
  return (
    <div className="flex items-start gap-4 rounded-box border border-dashed border-primary/40 bg-primary-soft p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-content">
        <Sparkles className="size-5" />
      </span>
      <div>
        <p className="font-semibold">Aún no tienes un plan activo</p>
        <p className="mt-1 text-sm text-muted">Elige uno de los planes para aparecer ante más clientes. El plan Básico es gratuito.</p>
      </div>
    </div>
  )
}
