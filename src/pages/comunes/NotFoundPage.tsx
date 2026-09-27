import { Link } from '@tanstack/react-router'
import { Compass } from 'lucide-react'
import { Logo } from '@/shared/ui'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-primary-tint px-4 text-center">
      <Logo />
      <div className="rounded-3xl bg-base-100 px-8 py-12 shadow-xl shadow-primary/10 sm:px-14">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-soft text-primary">
          <Compass className="size-7" />
        </span>
        <p className="mt-5 text-6xl font-extrabold tracking-tight text-primary">404</p>
        <h1 className="mt-2 text-xl font-bold">No encontramos esta página</h1>
        <p className="mt-1 max-w-sm text-muted">Es posible que el enlace esté roto o que la página se haya movido.</p>
        <Link to="/" className="btn btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
