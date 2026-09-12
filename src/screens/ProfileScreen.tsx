import { getStats } from '../stats';
import { swish } from '../audio';


export default function ProfileScreen({
  night,
  onToggleNight,
}: {
  night: boolean;
  onToggleNight: () => void;
}) {
  const s = getStats();

  const focus = `${Math.floor(s.focusedMs / 3600000)}h ${Math.floor(
    (s.focusedMs % 3600000) / 60000,
  )}m`;

  let eventCount = 0;
  try {
    const raw = localStorage.getItem('broadsheet.events');
    if (raw) {
      eventCount = Object.values(JSON.parse(raw) as Record<string, unknown[]>).flat().length;
    }
  } catch {
    /* ignore corrupted storage */
  }

  const rows = [
    { label: 'Horas em Foco', value: focus },
    { label: 'Tarefas Concluídas', value: String(s.completed) },
    { label: 'Dias Consecutivos', value: String(s.streak) },
    { label: 'Matérias Lidas', value: `${s.articles.length}/2` },
    { label: 'Eventos na Agenda', value: String(eventCount) },
  ];

  return (
    <section className="screen">
      <div className="colo-title">EXPEDIENTE</div>
      <div className="colo-sub">Colofão · Perfil do Leitor</div>

      <div className="staff">
        <b>Desde:</b> Setembro de 2026
      </div>

      <table className="stats">
        <thead>
          <tr>
            <th>Indicador</th>
            <th style={{ textAlign: 'right' }}>Registro</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="num">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="nightrow">
        <div className="lbl">Edição Noturna</div>
        <div className="desc">
          Alterna a tiragem para a versão noturna (modo escuro), invertendo tinta e
          papel.
        </div>
        <button
          className="toggle-ink"
          onClick={() => {
            swish();
            onToggleNight();
          }}
        >
          <span>NIGHT EDITION</span>
          <span>{night ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </section>
  );
}
