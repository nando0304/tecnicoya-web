import type { LucideIcon } from 'lucide-react'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

/** Clases de DaisyUI + la apariencia del diseño: fondo gris claro, borde suave y anillo violeta al enfocar. */
function controlClass(kind: 'input' | 'select' | 'textarea', invalid: boolean) {
  return cn(
    kind,
    'w-full bg-base-200 transition-colors focus-within:bg-base-100 focus-within:outline-4 focus-within:outline-offset-0',
    kind !== 'textarea' && 'h-11',
    invalid
      ? 'border-error focus-within:outline-error/15'
      : 'border-base-300 focus-within:border-primary focus-within:outline-primary/15',
  )
}

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-base-content/90">
        {label}
        {required && (
          <span className="text-error" aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-ayuda`} className="text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-ayuda`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

interface CommonProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
}

function useFieldIds(id: string | undefined, error?: string, hint?: string) {
  const generado = useId()
  const fieldId = id ?? generado
  return {
    fieldId,
    aria: {
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error || hint ? `${fieldId}-ayuda` : undefined,
    },
  }
}

type TextFieldProps = CommonProps &
  Omit<ComponentProps<'input'>, 'className' | 'required'> & {
    icon?: LucideIcon
    /** Contenido al final del campo (p. ej. botón para mostrar la contraseña). */
    end?: ReactNode
  }

export function TextField({ label, error, hint, required, className, icon: Icon, end, id, ...props }: TextFieldProps) {
  const { fieldId, aria } = useFieldIds(id, error, hint)
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint} required={required} className={className}>
      {Icon || end ? (
        <label className={controlClass('input', !!error)}>
          {Icon && <Icon className="size-4 shrink-0 text-muted" aria-hidden />}
          <input id={fieldId} className="min-w-0 grow" {...aria} {...props} />
          {end}
        </label>
      ) : (
        <input id={fieldId} className={controlClass('input', !!error)} {...aria} {...props} />
      )}
    </Field>
  )
}

type SelectFieldProps = CommonProps &
  Omit<ComponentProps<'select'>, 'className' | 'required'> & {
    options: { value: string | number; label: string }[]
    placeholder?: string
  }

export function SelectField({ label, error, hint, required, className, options, placeholder, id, ...props }: SelectFieldProps) {
  const { fieldId, aria } = useFieldIds(id, error, hint)
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint} required={required} className={className}>
      <select id={fieldId} className={controlClass('select', !!error)} {...aria} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

type TextAreaFieldProps = CommonProps & Omit<ComponentProps<'textarea'>, 'className' | 'required'>

export function TextAreaField({ label, error, hint, required, className, id, rows = 3, ...props }: TextAreaFieldProps) {
  const { fieldId, aria } = useFieldIds(id, error, hint)
  return (
    <Field label={label} htmlFor={fieldId} error={error} hint={hint} required={required} className={className}>
      <textarea id={fieldId} rows={rows} className={controlClass('textarea', !!error)} {...aria} {...props} />
    </Field>
  )
}

type CheckboxFieldProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  label: string
  description?: string
  className?: string
}

export function CheckboxField({ label, description, className, ...props }: CheckboxFieldProps) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', className)}>
      <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mt-0.5" {...props} />
      <span>
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </label>
  )
}

export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}

interface FormActionsProps {
  onCancel?: () => void
  submitLabel?: string
  loading?: boolean
}

export function FormActions({ onCancel, submitLabel = 'Guardar', loading = false }: FormActionsProps) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 border-t border-base-300 pt-5 sm:flex-row sm:justify-end">
      {onCancel && (
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
      )}
      <button type="submit" className="btn btn-primary shadow-md shadow-primary/25" disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {submitLabel}
      </button>
    </div>
  )
}
