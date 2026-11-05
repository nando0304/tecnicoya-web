import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { http } from '@/shared/api'
import { cn } from '@/shared/lib'
import { ejecutar } from '@/shared/ui'

/** Reportes Excel que genera la API con Apache POI (GET /api/reportes/{tipo}); solo para administradores. */
export type TipoReporte = 'usuarios' | 'tecnicos' | 'servicios' | 'general'

interface ExportarReporteButtonProps {
  reporte: TipoReporte
  label?: string
  className?: string
}

/** Descarga el reporte .xlsx del recurso indicado. */
export function ExportarReporteButton({ reporte, label = 'Exportar Excel', className }: ExportarReporteButtonProps) {
  const [descargando, setDescargando] = useState(false)

  const exportar = async () => {
    setDescargando(true)
    await ejecutar(() => http.descargar(`/reportes/${reporte}`, `tecnicoya-${reporte}.xlsx`), {
      exito: 'Reporte descargado',
    })
    setDescargando(false)
  }

  return (
    <button
      type="button"
      className={cn('btn btn-outline btn-success', className)}
      onClick={() => void exportar()}
      disabled={descargando}
    >
      {descargando ? <span className="loading loading-spinner loading-sm" /> : <FileSpreadsheet className="size-4" />}
      {label}
    </button>
  )
}
