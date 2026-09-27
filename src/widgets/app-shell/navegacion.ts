import type { LinkProps } from '@tanstack/react-router'
import {
  BadgeCheck,
  Briefcase,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileCheck2,
  GraduationCap,
  HardHat,
  Home,
  Layers,
  LayoutDashboard,
  Receipt,
  Search,
  Settings,
  Star,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { TipoUsuario } from '@/entities/usuario'

type Ruta = NonNullable<LinkProps['to']>

export interface ItemNav {
  to: Ruta
  label: string
  icon: LucideIcon
  /** Activo solo en la ruta exacta (las páginas de inicio de cada rol). */
  exact?: boolean
}

export interface GrupoNav {
  titulo?: string
  items: ItemNav[]
}

const CONFIGURACION: ItemNav = { to: '/configuracion', label: 'Configuración', icon: Settings }

export const NAVEGACION: Record<TipoUsuario, GrupoNav[]> = {
  ADMINISTRADOR: [
    { items: [{ to: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true }] },
    {
      titulo: 'Usuarios',
      items: [
        { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
        { to: '/admin/tecnicos', label: 'Técnicos', icon: HardHat },
      ],
    },
    {
      titulo: 'Operación',
      items: [
        { to: '/admin/servicios', label: 'Servicios', icon: ClipboardList },
        { to: '/admin/calificaciones', label: 'Calificaciones', icon: Star },
        { to: '/admin/comprobantes', label: 'Comprobantes de pago', icon: Receipt },
      ],
    },
    {
      titulo: 'Perfiles técnicos',
      items: [
        { to: '/admin/disponibilidades', label: 'Disponibilidad', icon: CalendarDays },
        { to: '/admin/experiencias', label: 'Experiencia laboral', icon: GraduationCap },
        { to: '/admin/evidencias', label: 'Evidencias', icon: FileCheck2 },
      ],
    },
    {
      titulo: 'Suscripciones',
      items: [
        { to: '/admin/planes', label: 'Planes', icon: Layers },
        { to: '/admin/suscripciones', label: 'Suscripciones', icon: BadgeCheck },
        { to: '/admin/pagos', label: 'Pagos de suscripción', icon: CreditCard },
      ],
    },
    { items: [CONFIGURACION] },
  ],
  TECNICO: [
    {
      items: [
        { to: '/tecnico', label: 'Inicio', icon: Home, exact: true },
        { to: '/tecnico/perfil', label: 'Mi perfil', icon: UserRound },
        { to: '/tecnico/servicios', label: 'Mis servicios', icon: Briefcase },
        { to: '/tecnico/disponibilidad', label: 'Disponibilidad', icon: CalendarDays },
        { to: '/tecnico/experiencia', label: 'Experiencia', icon: GraduationCap },
        { to: '/tecnico/evidencias', label: 'Evidencias', icon: FileCheck2 },
        { to: '/tecnico/resenas', label: 'Reseñas', icon: Star },
        { to: '/tecnico/suscripcion', label: 'Suscripción', icon: CreditCard },
        { to: '/tecnico/pagos', label: 'Pagos', icon: Wallet },
        CONFIGURACION,
      ],
    },
  ],
  CLIENTE: [
    {
      items: [
        { to: '/cliente', label: 'Inicio', icon: Home, exact: true },
        { to: '/cliente/tecnicos', label: 'Buscar técnicos', icon: Search },
        { to: '/cliente/solicitudes', label: 'Mis solicitudes', icon: ClipboardList },
        CONFIGURACION,
      ],
    },
  ],
}

/** A dónde lleva el buscador de la barra superior según el rol. */
export const BUSQUEDA = {
  ADMINISTRADOR: { to: '/admin/servicios', placeholder: 'Buscar servicios, clientes…' },
  TECNICO: { to: '/tecnico/servicios', placeholder: 'Buscar en mis servicios…' },
  CLIENTE: { to: '/cliente/tecnicos', placeholder: 'Buscar técnicos o especialidades…' },
} as const satisfies Record<TipoUsuario, { to: Ruta; placeholder: string }>
