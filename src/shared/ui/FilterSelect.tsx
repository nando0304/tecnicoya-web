interface FilterSelectProps<V extends string> {
  label: string
  value: V | ''
  onChange: (value: V | '') => void
  options: { value: V; label: string }[]
  /** Texto de la opción que no filtra. */
  todos?: string
}

/** Filtro compacto para la barra de herramientas de una tabla. */
export function FilterSelect<V extends string>({ label, value, onChange, options, todos = 'Todos' }: FilterSelectProps<V>) {
  return (
    <select
      className="select h-10 w-full border-base-300 bg-base-100 text-sm sm:w-auto"
      value={value}
      onChange={(e) => onChange(e.target.value as V | '')}
      aria-label={label}
    >
      <option value="">
        {label}: {todos}
      </option>
      {options.map((opcion) => (
        <option key={opcion.value} value={opcion.value}>
          {label}: {opcion.label}
        </option>
      ))}
    </select>
  )
}
