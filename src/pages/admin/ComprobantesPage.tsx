import { useState } from 'react'
import { useEvidenciasPago, useRemoveEvidenciaPago, type EvidenciaPago } from '@/entities/evidencia-pago'
import { EvidenciaPagoForm } from '@/features/evidencia-pago-form'
import { formatFechaHora, formatMoneda } from '@/shared/lib'
import { EstadoValidacion, MetodoPago } from '@/shared/model/enums'
import { EnlaceArchivo, FilterSelect, StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<EvidenciaPago>[] = [
  {
    header: 'Servicio',
    cell: (p) => (
      <div>
        <p className="font-medium">{p.servicioTitulo}</p>
        <p className="text-xs text-muted">#{p.servicioId}</p>
      </div>
    ),
  },
  { header: 'Monto', cell: (p) => <span className="font-semibold">{formatMoneda(p.monto)}</span>, className: 'whitespace-nowrap' },
  { header: 'Método', cell: (p) => MetodoPago.label(p.metodoPago) },
  { header: 'Fecha', cell: (p) => formatFechaHora(p.fechaPago), className: 'whitespace-nowrap' },
  { header: 'Comprobante', cell: (p) => <EnlaceArchivo url={p.archivoEvidencia} texto="Ver" /> },
  { header: 'Validación', cell: (p) => <StatusBadge def={EstadoValidacion} value={p.estadoValidacion} /> },
]

export function ComprobantesPage() {
  const query = useEvidenciasPago()
  const eliminar = useRemoveEvidenciaPago()
  const [estado, setEstado] = useState<EstadoValidacion | ''>('')

  return (
    <CrudPage
      title="Comprobantes de pago"
      description="Pagos de los clientes por los servicios realizados, con su comprobante."
      entidad="comprobante"
      query={query}
      columns={columnas}
      rowKey={(p) => p.idEvidenciaPago}
      searchText={(p) => `${p.servicioId} ${p.servicioTitulo} ${MetodoPago.label(p.metodoPago)}`}
      searchPlaceholder="Buscar por servicio…"
      filter={estado ? (p) => p.estadoValidacion === estado : undefined}
      toolbar={<FilterSelect label="Validación" value={estado} onChange={setEstado} options={EstadoValidacion.options} />}
      renderForm={({ item, cerrar }) => <EvidenciaPagoForm evidencia={item} puedeValidar onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(p) => eliminar.mutateAsync(p.idEvidenciaPago)}
      describir={(p) => `el comprobante de ${formatMoneda(p.monto)} del servicio “${p.servicioTitulo}”`}
    />
  )
}
