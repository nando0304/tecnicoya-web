import { useState } from 'react'
import { ejecutar } from './form/ejecutar'

/** Estado de un listado editable: formulario (alta/edición) y confirmación de borrado. */
export function useGestion<T>() {
  const [formulario, setFormulario] = useState<{ item?: T } | null>(null)
  const [aEliminar, setAEliminar] = useState<T | null>(null)
  const [eliminando, setEliminando] = useState(false)

  return {
    formulario,
    abrirNuevo: () => setFormulario({}),
    abrirEdicion: (item: T) => setFormulario({ item }),
    cerrarFormulario: () => setFormulario(null),
    aEliminar,
    pedirEliminar: (item: T) => setAEliminar(item),
    cancelarEliminar: () => setAEliminar(null),
    eliminando,
    confirmarEliminar: async (accion: (item: T) => Promise<unknown>, exito: string) => {
      if (!aEliminar) return
      setEliminando(true)
      const ok = await ejecutar(() => accion(aEliminar), { exito })
      setEliminando(false)
      if (ok) setAEliminar(null)
    },
  }
}
