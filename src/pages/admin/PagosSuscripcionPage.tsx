import { useMemo, useState } from 'react'
import { EstadoPago, usePagosSuscripcion, useRemovePagoSuscripcion, type PagoSuscripcion } from '@/entities/pago-suscripcion'
import { useTecnicos } from '@/entities/tecnico'
import { PagoSuscripcionForm } from '@/features/pago-suscripcion-form'
import { formatFechaHora, formatMoneda } from '@/shared/lib'
import { MetodoPago } from '@/shared/model/enums'
import { FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

type PagoConTecnico = PagoSuscripcion & { tecnicoNombre: string }

const columnas: Column<PagoConTecnico>[] = [
  { header: 'Técnico', cell: (p) => <span className="font-medium">{p.tecnicoNombre}</span> },
  { header: 'Plan', cell: (p) => p.nombrePlan },
  { header: 'Monto', cell: (p) => <span className="font-semibold">{formatMoneda(p.montoPago)}</span>, className: 'whitespace-nowrap' },
  { header: 'Método', cell: (p) => MetodoPago.label(p.metodoPago) },
  { header: 'Fecha', cell: (p) => formatFechaHora(p.fechaPago), className: 'whitespace-nowrap' },
  { header: 'Estado', cell: (p) => <StatusBadge def={EstadoPago} value={p.estadoPago} /> },
]

export function PagosSuscripcionPage() {
  const query = usePagosSuscripcion()
  const tecnicos = useTecnicos()
  const eliminar = useRemovePagoSuscripcion()
  const [estado, setEstado] = useState<EstadoPago | ''>('')

  // El pago trae el id del técnico, no su nombre
  const pagos = useMemo(() => {
    const nombres = new Map(tecnicos.data?.map((t) => [t.idTecnico, t.nombreCompleto]))
    return query.data?.map((p) => ({ ...p, tecnicoNombre: nombres.get(p.tecnicoId) ?? `Técnico #${p.tecnicoId}` }))
  }, [query.data, tecnicos.data])

  return (
    <CrudPage
      title="Pagos de suscripción"
      description="Cobros de los planes contratados por los técnicos."
      entidad="pago"
      query={{ ...query, data: pagos }}
      columns={columnas}
      rowKey={(p) => p.idPagoSuscripcion}
      searchText={(p) => `${p.tecnicoNombre} ${p.nombrePlan}`}
      searchPlaceholder="Buscar por técnico o plan…"
      filter={estado ? (p) => p.estadoPago === estado : undefined}
      toolbar={<FilterSelect label="Estado" value={estado} onChange={setEstado} options={EstadoPago.options} />}
      renderForm={({ item, cerrar }) => <PagoSuscripcionForm pago={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(p) => eliminar.mutateAsync(p.idPagoSuscripcion)}
      describir={(p) => `el pago de ${formatMoneda(p.montoPago)} de ${p.tecnicoNombre}`}
    />
  )
}
