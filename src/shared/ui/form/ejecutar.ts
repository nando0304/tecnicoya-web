import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError, getErrorMessage } from '@/shared/api'
import { toast } from '../toast'

interface Opciones<T extends FieldValues> {
  exito: string
  /** Si se pasa, los errores de validación de la API se muestran bajo su campo. */
  setError?: UseFormSetError<T>
}

/** Ejecuta una operación contra la API y avisa el resultado con un toast. Devuelve si tuvo éxito. */
export async function ejecutar<T extends FieldValues = FieldValues>(
  accion: () => Promise<unknown>,
  { exito, setError }: Opciones<T>,
): Promise<boolean> {
  try {
    await accion()
    toast.success(exito)
    return true
  } catch (error) {
    if (error instanceof ApiError && setError) {
      for (const [campo, mensaje] of Object.entries(error.fieldErrors)) {
        setError(campo as Path<T>, { type: 'server', message: mensaje })
      }
    }
    toast.error(getErrorMessage(error))
    return false
  }
}
