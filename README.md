# TécnicoYa Web

Frontend de TécnicoYa, la plataforma que conecta clientes con técnicos verificados para servicios a domicilio.
Consume la API REST de `tecnicoya-api` (Spring Boot).

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · DaisyUI 5 · TanStack Router · TanStack Query · React Hook Form + Zod · Zustand · Lucide.

## Requisitos

- Node.js 20 o superior
- La API `tecnicoya-api` en ejecución en `http://localhost:8080` (ver su README)

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
```

En desarrollo, Vite reenvía `/api` a `http://localhost:8080`, así que no hace falta configurar CORS.
Si la API está en otra dirección: `API_TARGET=http://otro-host:8080 npm run dev`,
o define `VITE_API_URL` para el build (ver `.env.example`).

| Script            | Qué hace                                  |
|-------------------|-------------------------------------------|
| `npm run dev`     | Servidor de desarrollo                    |
| `npm run build`   | Verifica tipos y genera `dist/`           |
| `npm run preview` | Sirve `dist/` (también reenvía `/api`)    |
| `npm run lint`    | ESLint                                    |

### Cuentas de prueba

Los usuarios de `tecnicoya-api/database/data.sql` usan la contraseña `TecnicoYa2026!`.
En desarrollo, la pantalla de inicio de sesión tiene botones para completarlas.

| Rol           | Correo                             |
|---------------|------------------------------------|
| Administrador | `carlos.mendoza@tecnicoya.example` |
| Técnico       | `pedro.ramirez@tecnicoya.example`  |
| Cliente       | `maria.quispe@correo.example`      |

## Funcionalidades por rol

- **Administrador:** panel con indicadores y bandeja de aprobación (verificar técnicos, aprobar evidencias y
  comprobantes, activar suscripciones) y mantenimiento completo (crear, editar, eliminar) de los 11 recursos de la API.
- **Técnico:** inicio, perfil (diseño `diseño/PERFIL TECNICO.png`), servicios asignados y solicitudes
  disponibles (aceptar, iniciar, finalizar, liberar), disponibilidad semanal, experiencia, evidencias, reseñas,
  suscripción a planes y pagos.
- **Cliente:** solicitar servicios, buscar técnicos verificados, ver su perfil público, seguir sus
  solicitudes, calificar y registrar pagos.
- **Todos:** registro, inicio de sesión (`POST /api/auth/login`), configuración de la cuenta y cambio de contraseña.

## Estructura (Feature-Sliced Design)

Cada capa solo importa de las capas inferiores:

```
src/
├── app/        providers (React Query, toasts) y router con guardas por rol
├── pages/      pantallas por rol: admin/, tecnico/, cliente/, comunes/
├── widgets/    bloques compuestos: app-shell, crud-page, tecnico-perfil, servicio-card…
├── features/   acciones del usuario: auth, cuenta y un formulario por recurso
├── entities/   un módulo por recurso de la API: tipos, enums en español y hooks de datos
└── shared/     cliente HTTP, CRUD genérico, validaciones, formatos y componentes de UI
```

- `shared/api/crud.ts` genera el cliente y los hooks de cualquier recurso: todos exponen el mismo CRUD.
- `widgets/crud-page` arma un mantenimiento completo a partir de columnas y un formulario.
- Los formularios validan con Zod las mismas reglas que los DTO de la API, y los errores de la API
  se muestran bajo el campo correspondiente.
- Cada rol se descarga como un archivo JS aparte, solo cuando se visita.

## Guía visual

Los colores salen de `diseño/*.png` y se definen como tema de DaisyUI en `src/index.css`:

| Uso                     | Color     |
|-------------------------|-----------|
| Primario                | `#7c3aed` |
| Primario oscuro         | `#6332e9` |
| Fondo violeta suave     | `#f5f3ff` |
| Texto / texto secundario | `#111827` / `#4b5563` |
| Bordes / fondo general  | `#e5e7eb` / `#f9fafb` |
| Éxito                   | `#10b981` sobre `#d1fae5` |
| Advertencia / estrellas | `#fbbf24` |
| Error                   | `#ef4444` |
| Azul marino             | `#1a0e3d` / `#2d1b69` |

## Limitaciones conocidas

- La API no emite tokens: la sesión se guarda en el navegador y los endpoints siguen abiertos.
  Para producción conviene agregar Spring Security con JWT.
- La API no recibe archivos: evidencias y comprobantes se registran como enlaces (Drive, OneDrive…).
- La API no tiene filtros por usuario: el frontend descarga cada listado y filtra en el navegador.
  Funciona con volúmenes académicos, pero con muchos datos convendría agregar endpoints filtrados y paginados.
