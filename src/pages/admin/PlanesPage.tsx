import { usePlanes, useRemovePlan, type PlanSuscripcion } from '@/entities/plan'
import { PlanForm } from '@/features/plan-form'
import { formatMoneda } from '@/shared/lib'
import { EstadoRegistro } from '@/shared/model/enums'
import { StatusBadge, type Column } from '@/shared/ui'
import { CrudPage } from '@/widgets/crud-page'

const columnas: Column<PlanSuscripcion>[] = [
  {
    header: 'Plan',
    cell: (p) => (
      <div className="max-w-sm">
        <p className="font-semibold">{p.nombrePlan}</p>
        {p.descripcion && <p className="line-clamp-2 text-xs text-muted">{p.descripcion}</p>}
      </div>
    ),
  },
  { header: 'Precio inicial', cell: (p) => (p.precioInicial === 0 ? 'Gratis' : formatMoneda(p.precioInicial)), className: 'whitespace-nowrap' },
  { header: 'Clientes / mes', cell: (p) => `Hasta ${p.limiteClientes}` },
  { header: 'Precio posterior', cell: (p) => formatMoneda(p.precioPosterior), className: 'whitespace-nowrap' },
  { header: 'Estado', cell: (p) => <StatusBadge def={EstadoRegistro} value={p.estado} /> },
]

export function PlanesPage() {
  const query = usePlanes()
  const eliminar = useRemovePlan()

  return (
    <CrudPage
      title="Planes de suscripción"
      description="Planes que los técnicos pueden contratar para recibir clientes."
      entidad="plan"
      query={query}
      columns={columnas}
      rowKey={(p) => p.idPlan}
      searchText={(p) => `${p.nombrePlan} ${p.descripcion ?? ''}`}
      searchPlaceholder="Buscar plan…"
      renderForm={({ item, cerrar }) => <PlanForm plan={item} onSuccess={cerrar} onCancel={cerrar} />}
      onDelete={(p) => eliminar.mutateAsync(p.idPlan)}
      describir={(p) => `el plan ${p.nombrePlan}`}
    />
  )
}
