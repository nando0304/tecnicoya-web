/** Minúsculas y sin tildes, para búsquedas que ignoran acentos ("Ramírez" = "ramirez"). */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function coincide(texto: string, busqueda: string): boolean {
  const consulta = normalizar(busqueda)
  return consulta === '' || normalizar(texto).includes(consulta)
}

/** Une clases condicionales: cn('btn', activo && 'btn-active'). */
export function cn(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(' ')
}

/** '' → null, para campos opcionales que la API valida con un patrón. */
export function textoOpcional(valor: string | null | undefined): string | null {
  const limpio = valor?.trim() ?? ''
  return limpio === '' ? null : limpio
}
