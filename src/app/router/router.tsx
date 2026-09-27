import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router'
// Acceso y 404 van en el paquete inicial; el resto se importa archivo por archivo para poder dividirlo
import { LoginPage, RegisterPage } from '@/pages/comunes/AuthPages'
import { NotFoundPage } from '@/pages/comunes/NotFoundPage'
import { ErrorState, LoadingState } from '@/shared/ui'
import { AppShell } from '@/widgets/app-shell'
import { redirigirAlInicio, requerirInvitado, requerirRol, requerirSesion, validarBusqueda } from './guards'

// Cada sección se descarga solo cuando se visita (un archivo JS por rol)
const admin = () => import('@/pages/admin')
const tecnico = () => import('@/pages/tecnico')
const cliente = () => import('@/pages/cliente')

const rootRoute = createRootRoute({ component: Outlet, notFoundComponent: NotFoundPage })

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', beforeLoad: redirigirAlInicio })
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: 'login', beforeLoad: requerirInvitado, component: LoginPage })
const registroRoute = createRoute({ getParentRoute: () => rootRoute, path: 'registro', beforeLoad: requerirInvitado, component: RegisterPage })

/** Layout con sesión: barra superior y menú lateral. */
const appRoute = createRoute({ getParentRoute: () => rootRoute, id: 'app', beforeLoad: requerirSesion, component: AppShell })

const configuracionRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'configuracion',
  component: lazyRouteComponent(() => import('@/pages/comunes/ConfiguracionPage'), 'ConfiguracionPage'),
})
const tecnicoPublicoRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'tecnicos/$tecnicoId',
  component: lazyRouteComponent(() => import('@/pages/comunes/TecnicoPublicoPage'), 'TecnicoPublicoPage'),
})

/* --- Administrador ------------------------------------------------------- */
const adminRoute = createRoute({ getParentRoute: () => appRoute, path: 'admin', beforeLoad: requerirRol('ADMINISTRADOR') })
const adminRoutes = [
  createRoute({ getParentRoute: () => adminRoute, path: '/', component: lazyRouteComponent(admin, 'AdminHomePage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'usuarios', component: lazyRouteComponent(admin, 'UsuariosPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'tecnicos', component: lazyRouteComponent(admin, 'TecnicosPage') }),
  createRoute({
    getParentRoute: () => adminRoute,
    path: 'servicios',
    validateSearch: validarBusqueda,
    component: lazyRouteComponent(admin, 'ServiciosPage'),
  }),
  createRoute({ getParentRoute: () => adminRoute, path: 'calificaciones', component: lazyRouteComponent(admin, 'CalificacionesPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'comprobantes', component: lazyRouteComponent(admin, 'ComprobantesPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'disponibilidades', component: lazyRouteComponent(admin, 'DisponibilidadesPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'experiencias', component: lazyRouteComponent(admin, 'ExperienciasPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'evidencias', component: lazyRouteComponent(admin, 'EvidenciasPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'planes', component: lazyRouteComponent(admin, 'PlanesPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'suscripciones', component: lazyRouteComponent(admin, 'SuscripcionesPage') }),
  createRoute({ getParentRoute: () => adminRoute, path: 'pagos', component: lazyRouteComponent(admin, 'PagosSuscripcionPage') }),
] as const

/* --- Técnico ------------------------------------------------------------- */
const tecnicoRoute = createRoute({ getParentRoute: () => appRoute, path: 'tecnico', beforeLoad: requerirRol('TECNICO') })
const tecnicoRoutes = [
  createRoute({ getParentRoute: () => tecnicoRoute, path: '/', component: lazyRouteComponent(tecnico, 'TecnicoHomePage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'perfil', component: lazyRouteComponent(tecnico, 'PerfilTecnicoPage') }),
  createRoute({
    getParentRoute: () => tecnicoRoute,
    path: 'servicios',
    validateSearch: validarBusqueda,
    component: lazyRouteComponent(tecnico, 'MisServiciosPage'),
  }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'disponibilidad', component: lazyRouteComponent(tecnico, 'DisponibilidadPage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'experiencia', component: lazyRouteComponent(tecnico, 'ExperienciaPage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'evidencias', component: lazyRouteComponent(tecnico, 'EvidenciasTecnicoPage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'resenas', component: lazyRouteComponent(tecnico, 'ResenasPage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'suscripcion', component: lazyRouteComponent(tecnico, 'SuscripcionPage') }),
  createRoute({ getParentRoute: () => tecnicoRoute, path: 'pagos', component: lazyRouteComponent(tecnico, 'PagosTecnicoPage') }),
] as const

/* --- Cliente ------------------------------------------------------------- */
const clienteRoute = createRoute({ getParentRoute: () => appRoute, path: 'cliente', beforeLoad: requerirRol('CLIENTE') })
const clienteRoutes = [
  createRoute({ getParentRoute: () => clienteRoute, path: '/', component: lazyRouteComponent(cliente, 'ClienteHomePage') }),
  createRoute({
    getParentRoute: () => clienteRoute,
    path: 'tecnicos',
    validateSearch: validarBusqueda,
    component: lazyRouteComponent(cliente, 'BuscarTecnicosPage'),
  }),
  createRoute({ getParentRoute: () => clienteRoute, path: 'solicitudes', component: lazyRouteComponent(cliente, 'MisSolicitudesPage') }),
] as const

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registroRoute,
  appRoute.addChildren([
    configuracionRoute,
    tecnicoPublicoRoute,
    adminRoute.addChildren(adminRoutes),
    tecnicoRoute.addChildren(tecnicoRoutes),
    clienteRoute.addChildren(clienteRoutes),
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPendingComponent: () => <LoadingState />,
  defaultErrorComponent: ({ error, reset }) => (
    <div className="p-6">
      <ErrorState error={error} onRetry={reset} />
    </div>
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
