const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export interface TicketSoporte {
  id: string;
  titulo: string;
  categoria: string;
  estado: string;
  creadoEn: string;
}

export interface Resena {
  id: number;
  tecnicoId: number;
  calificacion: number;
  comentario: string;
  fecha: string;
}

export interface Notificacion {
  id: number;
  usuarioId: number;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export interface Dispositivo {
  id: number;
  usuarioId: number;
  tipo: string;
  marca: string;
  modelo: string;
}

export interface Diagnostico {
  id: number;
  ticketId: string;
  causa: string;
  solucion: string;
  fecha: string;
}

export interface Cita {
  id: number;
  tecnicoId: number;
  modalidad: string;
  fechaHora: string;
  estado: string;
}

export interface Cotizacion {
  id: number;
  ticketId: string;
  detalle: string;
  monto: number;
  estado: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} en ${path}`);
  }
  return res.json() as Promise<T>;
}

export const tecnicoYaNuevasApi = {
  // Soporte
  listarTickets: () => request<TicketSoporte[]>("/api/soporte/tickets"),
  obtenerTicket: (id: string) =>
    request<TicketSoporte>(`/api/soporte/tickets/${id}`),
  crearTicket: (data: Partial<TicketSoporte>) =>
    request<TicketSoporte>("/api/soporte/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Reseñas
  listarResenas: () => request<Resena[]>("/api/resenas"),
  listarResenasPorTecnico: (tecnicoId: number) =>
    request<Resena[]>(`/api/resenas/tecnico/${tecnicoId}`),
  crearResena: (data: Partial<Resena>) =>
    request<Resena>("/api/resenas", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Notificaciones
  listarNotificaciones: (usuarioId: number) =>
    request<Notificacion[]>(`/api/notificaciones/usuario/${usuarioId}`),
  crearNotificacion: (data: Partial<Notificacion>) =>
    request<Notificacion>("/api/notificaciones", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  marcarNotificacionLeida: (id: number) =>
    request<Notificacion>(`/api/notificaciones/${id}/leida`, {
      method: "PUT",
    }),

  // Dispositivos
  listarDispositivos: (usuarioId: number) =>
    request<Dispositivo[]>(`/api/dispositivos/usuario/${usuarioId}`),
  registrarDispositivo: (data: Partial<Dispositivo>) =>
    request<Dispositivo>("/api/dispositivos", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  eliminarDispositivo: (id: number) =>
    request<{ mensaje: string; id: number }>(`/api/dispositivos/${id}`, {
      method: "DELETE",
    }),

  // Diagnósticos
  listarDiagnosticosPorTicket: (ticketId: string) =>
    request<Diagnostico[]>(`/api/diagnosticos/ticket/${ticketId}`),
  crearDiagnostico: (data: Partial<Diagnostico>) =>
    request<Diagnostico>("/api/diagnosticos", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Citas
  listarCitasPorTecnico: (tecnicoId: number) =>
    request<Cita[]>(`/api/citas/tecnico/${tecnicoId}`),
  agendarCita: (data: Partial<Cita>) =>
    request<Cita>("/api/citas", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  reprogramarCita: (id: number, fechaHora: string) =>
    request<Cita>(`/api/citas/${id}/reprogramar`, {
      method: "PUT",
      body: JSON.stringify({ fechaHora }),
    }),

  // Cotizaciones
  listarCotizacionesPorTicket: (ticketId: string) =>
    request<Cotizacion[]>(`/api/cotizaciones/ticket/${ticketId}`),
  crearCotizacion: (data: Partial<Cotizacion>) =>
    request<Cotizacion>("/api/cotizaciones", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  aprobarCotizacion: (id: number) =>
    request<Cotizacion>(`/api/cotizaciones/${id}/aprobar`, {
      method: "PUT",
    }),
};