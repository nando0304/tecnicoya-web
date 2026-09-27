import { Info } from 'lucide-react'
import { PageHeader } from '@/shared/ui'
import { TecnicoGate, VerificacionAviso } from '@/widgets/tecnico-gate'
import { DisponibilidadSemanal, EvidenciasLista, ExperienciaLista, ResenasLista } from '@/widgets/tecnico-perfil'

/* Páginas del técnico que muestran una sección de su perfil a pantalla completa. */

export function DisponibilidadPage() {
  return (
    <TecnicoGate>
      {(tecnico) => (
        <>
          <PageHeader title="Disponibilidad" description="Define los días y horarios en los que atiendes. Los clientes los verán en tu perfil." />
          <DisponibilidadSemanal tecnicoId={tecnico.idTecnico} editable />
        </>
      )}
    </TecnicoGate>
  )
}

export function ExperienciaPage() {
  return (
    <TecnicoGate>
      {(tecnico) => (
        <>
          <PageHeader title="Experiencia" description="Registra los trabajos que has realizado para mostrar tu trayectoria." />
          <ExperienciaLista tecnicoId={tecnico.idTecnico} editable />
        </>
      )}
    </TecnicoGate>
  )
}

export function EvidenciasTecnicoPage() {
  return (
    <TecnicoGate>
      {(tecnico) => (
        <>
          <PageHeader title="Evidencias" description="Sube certificados, antecedentes y fotos de tus trabajos para verificar tu perfil." />
          <VerificacionAviso tecnico={tecnico} />
          <div className="mb-6 flex items-start gap-3 rounded-box border border-primary/15 bg-primary-soft p-4 text-sm">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>
              Sube cada archivo a tu nube (Google Drive, OneDrive…) con acceso por enlace y pega el enlace aquí. Tu documento de identidad y
              antecedentes solo los ve el equipo de TécnicoYa; en tu perfil público se mostrarán como “Verificado”.
            </p>
          </div>
          <EvidenciasLista tecnicoId={tecnico.idTecnico} editable />
        </>
      )}
    </TecnicoGate>
  )
}

export function ResenasPage() {
  return (
    <TecnicoGate>
      {(tecnico) => (
        <>
          <PageHeader title="Reseñas" description="Lo que opinan tus clientes sobre los servicios que realizaste." />
          <ResenasLista tecnicoId={tecnico.idTecnico} />
        </>
      )}
    </TecnicoGate>
  )
}
