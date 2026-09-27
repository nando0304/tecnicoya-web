const LOCALE = 'es-PE'

const fechaFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })
const fechaHoraFmt = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const mesAnioFmt = new Intl.DateTimeFormat(LOCALE, { month: 'short', year: 'numeric' })
const monedaFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'PEN' })

const pad = (n: number) => String(n).padStart(2, '0')

/** Interpreta 'AAAA-MM-DD' o 'AAAA-MM-DDTHH:mm[:ss]' en hora local: la API no envía zona horaria. */
export function parseFecha(valor: string): Date {
  const [fecha, hora = '00:00:00'] = valor.split('T')
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [h = 0, min = 0, seg = 0] = hora.split(':').map(Number)
  return new Date(anio, mes - 1, dia, h, min, Math.floor(seg))
}

export const formatFecha = (valor?: string | null) => (valor ? fechaFmt.format(parseFecha(valor)) : '—')

export const formatFechaHora = (valor?: string | null) =>
  valor ? fechaHoraFmt.format(parseFecha(valor)) : '—'

export const formatMesAnio = (valor?: string | null) => (valor ? mesAnioFmt.format(parseFecha(valor)) : '—')

export const formatHora = (valor?: string | null) => (valor ? valor.slice(0, 5) : '—')

export const formatMoneda = (valor?: number | null) => (valor == null ? '—' : monedaFmt.format(valor))

/**
 * Iniciales de nombre y apellido. La API envía "Nombres Apellidos" en un solo texto:
 * con dos nombres y dos apellidos, el primer apellido es la palabra del medio.
 */
export function iniciales(nombre: string): string {
  const partes = nombre.split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[Math.floor(partes.length / 2)][0]).toUpperCase()
}

/* --- Conversión entre la API y los <input> ---------------------------------- */

/** 'AAAA-MM-DDTHH:mm:ss' → valor de <input type="datetime-local"> */
export const aInputFechaHora = (valor?: string | null) => (valor ? valor.slice(0, 16) : '')

/** 'HH:mm:ss' → valor de <input type="time"> */
export const aInputHora = (valor?: string | null) => (valor ? valor.slice(0, 5) : '')

export function hoyISO(fecha = new Date()): string {
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`
}

export function ahoraInput(fecha = new Date()): string {
  return `${hoyISO(fecha)}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`
}

export function sumarMeses(fechaIso: string, meses: number): string {
  const fecha = parseFecha(fechaIso)
  fecha.setMonth(fecha.getMonth() + meses)
  return hoyISO(fecha)
}

export function diasEntre(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / 86_400_000)
}

/** Años completos transcurridos desde una fecha 'AAAA-MM-DD'. */
export function aniosDesde(fechaIso: string, hoy = new Date()): number {
  const inicio = parseFecha(fechaIso)
  let anios = hoy.getFullYear() - inicio.getFullYear()
  const cumplido =
    hoy.getMonth() > inicio.getMonth() ||
    (hoy.getMonth() === inicio.getMonth() && hoy.getDate() >= inicio.getDate())
  if (!cumplido) anios--
  return Math.max(anios, 0)
}
