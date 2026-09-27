export interface Calificacion {
  idCalificacion: number
  servicioId: number
  servicioTitulo: string
  tecnicoId: number | null
  tecnicoNombre: string | null
  puntuacion: number
  comentario: string | null
  fechaCalificacion: string
}

/** Solo se pueden calificar servicios FINALIZADOS, una vez por servicio. */
export interface CalificacionRequest {
  servicioId: number
  puntuacion: number
  comentario: string | null
}

export interface ResumenCalificaciones {
  total: number
  promedio: number
  /** Porcentaje de calificaciones de 4 o 5 estrellas. */
  satisfechos: number
  /** Cantidad por puntuación: índice 0 = 1 estrella … índice 4 = 5 estrellas. */
  distribucion: number[]
}

export function resumirCalificaciones(calificaciones: Calificacion[]): ResumenCalificaciones {
  const total = calificaciones.length
  const distribucion = [0, 0, 0, 0, 0]
  let suma = 0
  for (const c of calificaciones) {
    distribucion[c.puntuacion - 1]++
    suma += c.puntuacion
  }
  return {
    total,
    promedio: total ? suma / total : 0,
    satisfechos: total ? Math.round(((distribucion[3] + distribucion[4]) / total) * 100) : 0,
    distribucion,
  }
}
