import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound, X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useSession } from '@/entities/session'
import { nombreCompleto, nombreCorto, SUBTITULO_ROL, type Usuario } from '@/entities/usuario'
import { useLogout, useSincronizarSesion } from '@/features/auth'
import { cn } from '@/shared/lib'
import { Avatar, Logo } from '@/shared/ui'
import { BUSQUEDA, NAVEGACION, type GrupoNav } from './navegacion'
import { useAvisos } from './use-avisos'

const CLAVE_COLAPSADO = 'tecnicoya.menu-colapsado'

function leerColapsado(): boolean {
  try {
    return localStorage.getItem(CLAVE_COLAPSADO) === '1'
  } catch {
    return false
  }
}

/** Quita el foco del menú desplegable de DaisyUI para cerrarlo tras elegir una opción. */
function cerrarDesplegable() {
  ;(document.activeElement as HTMLElement | null)?.blur()
}

/** Layout de las pantallas con sesión: barra superior, menú lateral y contenido. */
export function AppShell() {
  const usuario = useSession((s) => s.usuario)
  const [menuMovil, setMenuMovil] = useState(false)
  const [colapsado, setColapsado] = useState(leerColapsado)

  useEffect(() => {
    if (!menuMovil) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && setMenuMovil(false)
    document.addEventListener('keydown', alPresionar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alPresionar)
      document.body.style.overflow = ''
    }
  }, [menuMovil])

  // Al cerrar sesión el usuario pasa a null antes de navegar: no se renderiza nada protegido
  if (!usuario) return null

  const grupos = NAVEGACION[usuario.tipoUsuario]

  const alternarMenu = () => {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      const nuevo = !colapsado
      setColapsado(nuevo)
      try {
        localStorage.setItem(CLAVE_COLAPSADO, nuevo ? '1' : '0')
      } catch {
        /* preferencia no persistente */
      }
    } else {
      setMenuMovil(true)
    }
  }

  return (
    <div className="min-h-svh bg-base-200">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-content focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>

      <SincronizarSesion usuario={usuario} />
      <Topbar usuario={usuario} onMenu={alternarMenu} />

      <div className="flex min-h-[calc(100svh-4.5rem)]">
        {/* La columna ocupa todo el alto (fondo y borde); el menú dentro queda fijo al hacer scroll */}
        <div
          className={cn(
            'hidden shrink-0 border-r border-base-300 bg-base-100 transition-[width] duration-200 lg:block',
            colapsado ? 'w-20' : 'w-64',
          )}
        >
          <aside className="sticky top-18 h-[calc(100svh-4.5rem)]">
            <SidebarNav grupos={grupos} colapsado={colapsado} />
          </aside>
        </div>

        <main id="contenido" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {menuMovil && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú principal">
          <button
            type="button"
            className="absolute inset-0 bg-secondary/40 backdrop-blur-[2px]"
            onClick={() => setMenuMovil(false)}
            aria-label="Cerrar menú"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-base-100 shadow-2xl">
            <div className="flex h-18 shrink-0 items-center justify-between border-b border-base-300 px-5">
              <Logo />
              <button type="button" className="btn btn-square btn-ghost btn-sm" onClick={() => setMenuMovil(false)} aria-label="Cerrar menú">
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav grupos={grupos} onNavigate={() => setMenuMovil(false)} />
          </aside>
        </div>
      )}
    </div>
  )
}

function SincronizarSesion({ usuario }: { usuario: Usuario }) {
  useSincronizarSesion(usuario)
  return null
}

function Topbar({ usuario, onMenu }: { usuario: Usuario; onMenu: () => void }) {
  const navigate = useNavigate()
  const busqueda = BUSQUEDA[usuario.tipoUsuario]
  const [consulta, setConsulta] = useState('')

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const q = consulta.trim()
    void navigate({ to: busqueda.to, search: q ? { q } : {} })
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-2 border-b border-base-300 bg-base-100/95 px-3 backdrop-blur sm:gap-4 sm:px-6">
      <button type="button" className="btn btn-square btn-ghost" onClick={onMenu} aria-label="Mostrar u ocultar el menú">
        <Menu className="size-6" />
      </button>
      <Link to="/" className="shrink-0" aria-label="TécnicoYa, ir al inicio">
        <Logo className="max-sm:[&>span:last-child]:hidden" />
      </Link>

      <form role="search" onSubmit={buscar} className="ml-4 hidden max-w-md flex-1 md:block lg:ml-10">
        <label className="input h-10 w-full border-base-300 bg-base-100 focus-within:border-primary focus-within:outline-4 focus-within:outline-offset-0 focus-within:outline-primary/15">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            type="search"
            className="grow"
            placeholder={busqueda.placeholder}
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            aria-label={busqueda.placeholder}
          />
        </label>
      </form>

      <div className="ml-auto flex items-center gap-1 sm:gap-3">
        <AvisosMenu usuario={usuario} />
        <div className="hidden h-8 w-px bg-base-300 sm:block" aria-hidden />
        <UsuarioMenu usuario={usuario} />
      </div>
    </header>
  )
}

function AvisosMenu({ usuario }: { usuario: Usuario }) {
  const avisos = useAvisos(usuario)
  const total = avisos.reduce((suma, a) => suma + a.cantidad, 0)

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-ghost relative"
        aria-label={total ? `Avisos: ${total} pendientes` : 'Avisos: sin pendientes'}
      >
        <Bell className="size-5" />
        {total > 0 && (
          <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-error px-1 text-[10px] font-bold leading-4 text-error-content">
            {total > 9 ? '9+' : total}
          </span>
        )}
      </div>
      <div tabIndex={0} className="dropdown-content z-40 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
        <p className="px-3 pb-2 pt-1 text-sm font-semibold">Avisos</p>
        {avisos.length === 0 ? (
          <p className="px-3 pb-3 text-sm text-muted">No tienes pendientes. ¡Todo al día!</p>
        ) : (
          <ul className="menu w-full p-0">
            {avisos.map((aviso) => (
              <li key={aviso.label}>
                <Link to={aviso.to} onClick={cerrarDesplegable} className="justify-between">
                  {aviso.label}
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{aviso.cantidad}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function UsuarioMenu({ usuario }: { usuario: Usuario }) {
  const logout = useLogout()

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="flex cursor-pointer items-center gap-3 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-base-200 sm:px-2" aria-label="Menú de la cuenta">
        <Avatar nombre={nombreCorto(usuario)} />
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight">{nombreCorto(usuario)}</span>
          <span className="block text-xs text-muted">{SUBTITULO_ROL[usuario.tipoUsuario]}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted sm:block" aria-hidden />
      </div>
      <ul tabIndex={0} className="menu dropdown-content z-40 mt-2 w-64 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg">
        <li className="pointer-events-none mb-1 border-b border-base-300 px-3 pb-3 pt-2">
          <span className="block p-0 text-sm font-semibold">{nombreCompleto(usuario)}</span>
          <span className="block truncate p-0 text-xs text-muted">{usuario.correo}</span>
        </li>
        {usuario.tipoUsuario === 'TECNICO' && (
          <li>
            <Link to="/tecnico/perfil" onClick={cerrarDesplegable}>
              <UserRound className="size-4" /> Mi perfil
            </Link>
          </li>
        )}
        <li>
          <Link to="/configuracion" onClick={cerrarDesplegable}>
            <Settings className="size-4" /> Configuración
          </Link>
        </li>
        <li>
          <button type="button" className="text-error" onClick={logout}>
            <LogOut className="size-4" /> Cerrar sesión
          </button>
        </li>
      </ul>
    </div>
  )
}

function SidebarNav({ grupos, colapsado = false, onNavigate }: { grupos: GrupoNav[]; colapsado?: boolean; onNavigate?: () => void }) {
  const logout = useLogout()

  return (
    <nav className="flex h-full flex-col overflow-y-auto px-3 py-5" aria-label="Menú principal">
      <div className="flex-1 space-y-5">
        {grupos.map((grupo, i) => (
          <div key={grupo.titulo ?? i}>
            {grupo.titulo && !colapsado && (
              <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted/70">{grupo.titulo}</p>
            )}
            <ul className="space-y-1">
              {grupo.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.exact ?? false }}
                    onClick={onNavigate}
                    title={colapsado ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-base-content/80 transition-colors hover:bg-base-200 hover:text-base-content',
                      colapsado && 'justify-center px-0',
                    )}
                    activeProps={{ className: 'bg-primary-soft! text-primary! font-semibold' }}
                  >
                    <item.icon className="size-5 shrink-0" aria-hidden />
                    {colapsado ? <span className="sr-only">{item.label}</span> : <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={logout}
        title={colapsado ? 'Cerrar sesión' : undefined}
        className={cn(
          'mt-4 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10',
          colapsado && 'justify-center px-0',
        )}
      >
        <LogOut className="size-5 shrink-0" aria-hidden />
        {colapsado ? <span className="sr-only">Cerrar sesión</span> : 'Cerrar sesión'}
      </button>
    </nav>
  )
}
