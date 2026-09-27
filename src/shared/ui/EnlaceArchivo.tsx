import { ExternalLink } from 'lucide-react'

/** Enlace externo a un archivo; solo acepta http(s) para no abrir esquemas peligrosos. */
export function EnlaceArchivo({ url, texto = 'Abrir' }: { url: string; texto?: string }) {
  if (!/^https?:\/\//i.test(url)) return <span className="text-muted">—</span>
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      {texto} <ExternalLink className="size-3.5" aria-hidden />
      <span className="sr-only">(se abre en otra pestaña)</span>
    </a>
  )
}
