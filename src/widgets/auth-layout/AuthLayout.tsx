import { BadgeCheck, CalendarCheck, ShieldCheck, Star, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import { Logo } from '@/shared/ui'

const BENEFICIOS = [
  { icon: ShieldCheck, texto: 'Técnicos con identidad y certificados verificados' },
  { icon: Star, texto: 'Reseñas reales de clientes después de cada servicio' },
  { icon: CalendarCheck, texto: 'Agenda según la disponibilidad de cada técnico' },
]

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  /** Ancho de la tarjeta del formulario. */
  ancho?: 'md' | 'lg'
}

/** Pantallas de acceso: panel de marca a la izquierda (escritorio) y formulario a la derecha. */
export function AuthLayout({ title, subtitle, children, footer, ancho = 'md' }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh bg-primary-tint lg:bg-base-100">
      <aside className="relative hidden w-[46%] max-w-2xl overflow-hidden bg-linear-to-br from-primary via-primary-strong to-navy p-12 text-primary-content lg:flex lg:flex-col xl:p-16">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-primary-light/20 blur-3xl" aria-hidden />

        <div className="relative flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
            <Wrench className="size-5" aria-hidden />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">
            Técnico<span className="text-primary-light">Ya</span>
          </span>
        </div>

        <div className="relative my-auto py-12">
          <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight xl:text-[2.75rem]">
            El técnico que necesitas, en la puerta de tu casa.
          </h2>
          <ul className="mt-8 space-y-4">
            {BENEFICIOS.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-white/90">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                {texto}
              </li>
            ))}
          </ul>

          {/* Vista previa de una tarjeta de técnico */}
          <div className="mt-12 max-w-sm rounded-2xl bg-white/95 p-5 text-base-content shadow-2xl shadow-navy/40">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-linear-to-br from-primary to-primary-strong font-semibold text-primary-content">
                PR
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 font-semibold">
                  Pedro Ramírez <BadgeCheck className="size-4 text-primary" aria-hidden />
                </p>
                <p className="text-sm text-muted">Electricidad · 7+ años</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-1 text-sm font-semibold">
                <Star className="size-3.5 fill-accent text-accent" aria-hidden /> 5.0
              </span>
            </div>
            <p className="mt-3 rounded-lg bg-primary-soft px-3 py-2 text-sm text-primary">“Excelente trabajo, muy puntual.”</p>
          </div>
        </div>

        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} TécnicoYa</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div
          className={
            ancho === 'lg'
              ? 'w-full max-w-2xl rounded-3xl bg-base-100 p-6 shadow-xl shadow-primary/10 sm:p-10 lg:shadow-none'
              : 'w-full max-w-md rounded-3xl bg-base-100 p-6 shadow-xl shadow-primary/10 sm:p-10 lg:shadow-none'
          }
        >
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <h1 className="text-center text-3xl font-bold tracking-tight text-secondary lg:text-left">{title}</h1>
          <p className="mt-2 text-center text-muted lg:text-left">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
