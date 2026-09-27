import { useUsuarioActual } from '@/entities/session'
import { EstadoUsuario, TipoUsuario } from '@/entities/usuario'
import { CambiarContrasenaForm, DatosPersonalesForm } from '@/features/cuenta'
import { formatFecha } from '@/shared/lib'
import { PageHeader, Panel, ReadOnlyField, StatusBadge } from '@/shared/ui'

export function ConfiguracionPage() {
  const usuario = useUsuarioActual()

  return (
    <>
      <PageHeader title="Configuración" description="Administra los datos de tu cuenta y tu contraseña." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
        <Panel title="Datos personales" description="Así te identifican los demás usuarios de TécnicoYa.">
          {/* key: al guardar, el formulario se reinicia con los datos actualizados de la sesión */}
          <DatosPersonalesForm key={`${usuario.correo}-${usuario.telefono}-${usuario.nombres}-${usuario.apellidos}`} usuario={usuario} />
        </Panel>

        <div className="space-y-6">
          <Panel title="Seguridad" description="Te pediremos tu contraseña actual para confirmar el cambio.">
            <CambiarContrasenaForm usuario={usuario} />
          </Panel>
          <Panel title="Tu cuenta">
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField label="Tipo de cuenta" value={<StatusBadge def={TipoUsuario} value={usuario.tipoUsuario} />} />
              <ReadOnlyField label="Estado" value={<StatusBadge def={EstadoUsuario} value={usuario.estado} />} />
              <ReadOnlyField label="Miembro desde" value={formatFecha(usuario.fechaRegistro)} className="sm:col-span-2" />
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
