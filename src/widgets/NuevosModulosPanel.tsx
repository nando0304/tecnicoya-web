import { useEffect, useState } from "react";
import {
  tecnicoYaNuevasApi,
  type Cita,
  type Cotizacion,
  type Diagnostico,
  type Dispositivo,
  type Notificacion,
  type Resena,
  type TicketSoporte,
} from "../shared/api/TecnicoYaNuevasApis";

export function NuevosModulosPanel() {
  const [tickets, setTickets] = useState<TicketSoporte[]>([]);
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      tecnicoYaNuevasApi.listarTickets(),
      tecnicoYaNuevasApi.listarResenas(),
      tecnicoYaNuevasApi.listarNotificaciones(1),
      tecnicoYaNuevasApi.listarDispositivos(1),
      tecnicoYaNuevasApi.listarDiagnosticosPorTicket("TCK-1001"),
      tecnicoYaNuevasApi.listarCitasPorTecnico(10),
      tecnicoYaNuevasApi.listarCotizacionesPorTicket("TCK-1001"),
    ])
      .then(([t, r, n, d, dg, ct, co]) => {
        setTickets(t);
        setResenas(r);
        setNotificaciones(n);
        setDispositivos(d);
        setDiagnosticos(dg);
        setCitas(ct);
        setCotizaciones(co);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Soporte ({tickets.length})</h2>
      <ul>
        {tickets.map((t) => (
          <li key={t.id}>
            {t.id} - {t.titulo} ({t.estado})
          </li>
        ))}
      </ul>

      <h2>Reseñas ({resenas.length})</h2>
      <ul>
        {resenas.map((r) => (
          <li key={r.id}>
            ★{r.calificacion} - {r.comentario}
          </li>
        ))}
      </ul>

      <h2>Notificaciones ({notificaciones.length})</h2>
      <ul>
        {notificaciones.map((n) => (
          <li key={n.id}>
            {n.mensaje} [{n.leida ? "Leída" : "Nueva"}]
          </li>
        ))}
      </ul>

      <h2>Dispositivos ({dispositivos.length})</h2>
      <ul>
        {dispositivos.map((d) => (
          <li key={d.id}>
            {d.tipo} {d.marca} {d.modelo}
          </li>
        ))}
      </ul>

      <h2>Diagnósticos ({diagnosticos.length})</h2>
      <ul>
        {diagnosticos.map((dg) => (
          <li key={dg.id}>
            Causa: {dg.causa} | Solución: {dg.solucion}
          </li>
        ))}
      </ul>

      <h2>Citas ({citas.length})</h2>
      <ul>
        {citas.map((c) => (
          <li key={c.id}>
            {c.modalidad} - {c.fechaHora} ({c.estado})
          </li>
        ))}
      </ul>

      <h2>Cotizaciones ({cotizaciones.length})</h2>
      <ul>
        {cotizaciones.map((co) => (
          <li key={co.id}>
            {co.detalle} - S/ {co.monto} ({co.estado})
          </li>
        ))}
      </ul>
    </div>
  );
}