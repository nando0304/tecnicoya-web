/** Tono visual de un estado; lo traduce a colores StatusBadge. */
export type Tone = 'neutral' | 'primary' | 'info' | 'success' | 'warning' | 'error'

export interface EnumDef<K extends string> {
  /** Valores tal como los envía la API; sirve directamente para z.enum(). */
  values: readonly [K, ...K[]]
  label: (value: K) => string
  tone: (value: K) => Tone
  options: { value: K; label: string }[]
}

/**
 * Define un enum de la API con su etiqueta en español y su tono.
 * Sustituye a los `enum` de TypeScript (el proyecto usa erasableSyntaxOnly).
 */
export function defineEnum<const T extends Record<string, readonly [label: string, tone: Tone]>>(
  definicion: T,
): EnumDef<keyof T & string> {
  type K = keyof T & string
  const values = Object.keys(definicion) as K[]
  return {
    values: values as unknown as readonly [K, ...K[]],
    label: (value) => definicion[value]?.[0] ?? value,
    tone: (value) => definicion[value]?.[1] ?? 'neutral',
    options: values.map((value) => ({ value, label: definicion[value][0] })),
  }
}

export type EnumValue<E> = E extends EnumDef<infer K> ? K : never
