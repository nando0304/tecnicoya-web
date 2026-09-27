import type { EstadoRegistro } from '@/shared/model/enums'

export interface PlanSuscripcion {
  idPlan: number
  nombrePlan: string
  precioInicial: number
  limiteClientes: number
  precioPosterior: number
  descripcion: string | null
  estado: EstadoRegistro
}

export interface PlanSuscripcionRequest {
  nombrePlan: string
  precioInicial: number
  limiteClientes: number
  precioPosterior: number
  descripcion: string | null
  estado?: EstadoRegistro | null
}
