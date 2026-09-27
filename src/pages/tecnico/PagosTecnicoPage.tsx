import { Clock, CreditCard, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useEvidenciasPago, type EvidenciaPago } from '@/entities/evidencia-pago'
import { EstadoPago, usePagosSuscripcion, type PagoSuscripcion } from '@/entities/pago-suscripcion'
import { useServicios } from '@/entities/servicio'
import type { Tecnico } from '@/entities/tecnico'
import { formatFechaHora, formatMoneda } from '@/shared/lib'
import { EstadoValidacion, MetodoPago } from '@/shared/model/enums'
import { DataTable, EnlaceArchivo, PageHeader, StatCard, StatusBadge, Tabs, type Column } from '@/shared/ui'
import { TecnicoGate } from '@/widgets/tecnico-gate'

export function PagosTecnicoPage() {
  return <TecnicoGate>{(tecnico) => <Pagos tecnico={tecnico} />}</TecnicoGate>
}

const columnasCobros: Column<EvidenciaPago>[] = [
  { header: 'Servicio', cell: (p) => <span className="font-medium">{p.servicioTitulo}</span> },
  { header: 'Monto', cell: (p) => <span className="font-semibold">{formatMoneda(p.monto)}</span>, className: 'whitespace-nowrap' },
  { header: 'Método', cell: (p) => MetodoPago.label(p.metodoPago) },
  { header: 'Fecha', cell: (p) => formatFechaHora(p.fechaPago), className: 'whitespace-nowrap' },
  { header: 'Comprobante', cell: (p) => <EnlaceArchivo url={p.archivoEvidencia} texto="Ver" /> },
  { header: 'Validación', cell: (p) => <StatusBadge def={EstadoValidacion} value={p.estadoValidacion} /> },
]

const columnasSuscripcion: Column<PagoSuscripcion>[] = [
  { header: 'Plan', cell: (p) => <span className="font-medium">{p.nombrePlan}</span> },
  { header: 'Monto', cell: (p) => <span className="font-semibold">{formatMoneda(p.montoPago)}</span>, className: 'whitespace-nowrap' },
  { header: 'Método', cell: (p) => MetodoPago.label(p.metodoPago) },
  { header: 'Fecha', cell: (p) => formatFechaHora(p.fechaPago), className: 'whitespace-nowrap' },
  { header: 'Estado', cell: (p) => <StatusBadge def={EstadoPago} value={p.estadoPago} /> },
]

type Pestana = 'cobros' | 'suscripcion'

function Pagos({ tecnico }: { tecnico: Tecnico }) {
  const comprobantes = useEvidenciasPago()
  const servicios = useServicios()
  const pagos = usePagosSuscripcion()
  const [pestana, setPestana] = useState<Pestana>('cobros')

  const datos = useMemo(() => {
    // El comprobante no trae el técnico: se relaciona con sus servicios
    const misServicios = new Set(servicios.data?.filter((s) => s.tecnicoId === tecnico.idTecnico).map((s) => s.idServicio))
    const cobros = (comprobantes.data ?? [])
      .filter((c) => misServicios.has(c.servicioId))
      .sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
    const suscripcion = (pagos.data ?? []).filter((p) => p.tecnicoId === tecnico.idTecnico).sort((a, b) => b.fechaPago.localeCompare(a.fechaPago))
    const suma = (lista: { monto: number }[]) => lista.reduce((total, p) => total + p.monto, 0)
    return {
      cobros,
      suscripcion,
      cobrado: suma(cobros.filter((c) => c.estadoValidacion === 'APROBADO')),
      porValidar: cobros.filter((c) => c.estadoValidacion === 'PENDIENTE'),
      invertido: suscripcion.filter((p) => p.estadoPago === 'APROBADO').reduce((total, p) => total + p.montoPago, 0),
    }
  }, [comprobantes.data, servicios.data, pagos.data, tecnico.idTecnico])

  return (
    <>
      <PageHeader title="Pagos" description="Cobros de tus servicios y pagos de tu suscripción." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cobrado por servicios" value={formatMoneda(datos.cobrado)} icon={Wallet} tone="success" hint="Comprobantes validados" />
        <StatCard
          label="Por validar"
          value={formatMoneda(datos.porValidar.reduce((t, c) => t + c.monto, 0))}
          icon={Clock}
          tone="warning"
          hint={`${datos.porValidar.length} comprobantes en revisión`}
        />
        <StatCard label="Pagado en suscripciones" value={formatMoneda(datos.invertido)} icon={CreditCard} hint="Pagos aprobados" />
      </div>

      <Tabs
        value={pestana}
        onChange={setPestana}
        className="mb-5 mt-8"
        tabs={[
          { id: 'cobros', label: `Cobros por servicios (${datos.cobros.length})` },
          { id: 'suscripcion', label: `Pagos de suscripción (${datos.suscripcion.length})` },
        ]}
      />

      {pestana === 'cobros' ? (
        <DataTable
          rows={datos.cobros}
          columns={columnasCobros}
          rowKey={(p) => p.idEvidenciaPago}
          searchText={(p) => p.servicioTitulo}
          searchPlaceholder="Buscar por servicio…"
          isLoading={comprobantes.isLoading || servicios.isLoading}
          error={comprobantes.error ?? servicios.error}
          emptyTitle="Aún no hay cobros registrados"
          emptyDescription="Registra el pago desde “Mis servicios” cuando el cliente te pague."
        />
      ) : (
        <DataTable
          rows={datos.suscripcion}
          columns={columnasSuscripcion}
          rowKey={(p) => p.idPagoSuscripcion}
          isLoading={pagos.isLoading}
          error={pagos.error}
          emptyTitle="Aún no hay pagos de suscripción"
        />
      )}
    </>
  )
}
