import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { playAlarmChime } from '../lofi';
import { tap, pluck, toss, bellOn, bellOff } from '../audio';

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

type Cell = number | null;

function buildWeeks(year: number, month: number): Cell[][] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = [
    ...Array<Cell>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

type Ev = { id: string; time: string; name: string; alarm: boolean };
type EventMap = Record<string, Ev[]>; // key: 'YYYY-MM-DD'

const STORE_KEY = 'broadsheet.events';

const pad2 = (n: number) => String(n).padStart(2, '0');

const dateKey = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

function loadEvents(): EventMap {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as EventMap;
  } catch {
    /* ignore corrupted storage */
  }
  return {};
}

const newId = () =>
  `u${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// only 3 months are visible (previous, current, next); drop stored event
// keys outside that window so past marcações self-delete
function pruneEvents(map: EventMap, at: Date): EventMap {
  const window = [-1, 0, 1].map((o) => {
    const d = new Date(at.getFullYear(), at.getMonth() + o, 1);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
  });
  const pruned: EventMap = {};
  Object.entries(map).forEach(([k, v]) => {
    if (window.includes(k.slice(0, 7))) pruned[k] = v;
  });
  return pruned;
}

function showNotification(time: string, name: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(`ALMANAQUE · ${time}`, { body: name });
  } catch {
    /* ignore notification errors */
  }
}

const Trash = ({
  onToss,
}: {
  onToss: (e: MouseEvent) => void;
}) => (
  <svg
    className="ag-trash"
    viewBox="0 0 24 24"
    onClick={onToss}
    aria-label="Apagar"
  >
    <path d="M5 7h14M10 7V4h4v3M8 7l1 13h6l1-13" />
  </svg>
);

const Bell = ({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: (e: MouseEvent) => void;
}) => (
  <svg
    className={`ag-bell${on ? ' on' : ''}`}
    viewBox="0 0 24 24"
    onClick={onToggle}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default function EventsScreen() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const [picked, setPicked] = useState(today);
  const [viewOffset, setViewOffset] = useState(0);
  const [events, setEvents] = useState<EventMap>(loadEvents);
  const [formOpen, setFormOpen] = useState(false);
  const [formTime, setFormTime] = useState('');
  const [formName, setFormName] = useState('');
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const timeoutsRef = useRef<number[]>([]);
  const firedRef = useRef<Set<string>>(new Set());

  const viewDate = new Date(year, month + viewOffset, 1);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const weeks = buildWeeks(viewYear, viewMonth);

  const pickedKey = dateKey(viewYear, viewMonth, picked);

  // every marcação across all stored months/days, grouped month -> date,
  // events inside each date sorted by time
  const months: Array<{
    y: number;
    m: number;
    dates: Array<{ key: string; d: number; list: Ev[] }>;
  }> = [];
  Object.entries(events)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, list]) => {
      const [y, m, d] = key.split('-').map(Number);
      const item = {
        key,
        d,
        list: [...list].sort((a, b) => a.time.localeCompare(b.time)),
      };
      const last = months[months.length - 1];
      if (last && last.y === y && last.m === m) last.dates.push(item);
      else months.push({ y, m, dates: [item] });
    });

  const navigate = (dir: number) => {
    const next = Math.max(-1, Math.min(1, viewOffset + dir));
    if (next === viewOffset) return;
    tap();
    setViewOffset(next);
    setPicked(1);
  };

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(events));
  }, [events]);

  // auto-delete stored marcações outside the 3-month window
  useEffect(() => {
    setEvents((prev) => {
      const pruned = pruneEvents(prev, new Date());
      return Object.keys(pruned).length === Object.keys(prev).length ? prev : pruned;
    });
  }, []);

  // automatic alarms: schedule a timeout for every alarmed event; the effect
  // re-runs on state changes, recomputing remaining deltas. Cleanup clears
  // pending timeouts so nothing fires twice.
  useEffect(() => {
    const nowMs = new Date().getTime();
    Object.entries(events).forEach(([key, list]) =>
      list.forEach((ev) => {
        if (!ev.alarm || firedRef.current.has(ev.id)) return;
        const [h, m] = ev.time.split(':').map(Number);
        const [ky, km, kd] = key.split('-').map(Number);
        if (![h, m, ky, km, kd].every(Number.isFinite)) return;
        // each event fires on its own stored date, not the picked day
        const at = new Date(ky, km - 1, kd, h, m, 0).getTime();
        const delta = at - nowMs;
        if (delta <= 0) {
          firedRef.current.add(ev.id);
          return;
        }
        const id = window.setTimeout(() => {
          firedRef.current.add(ev.id);
          playAlarmChime();
          showNotification(ev.time, ev.name);
        }, delta);
        timeoutsRef.current.push(id);
      }),
    );
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, [events]);

  const pickDay = (d: number) => {
    pluck();
    setPicked(d);
    setFormOpen(true);
  };

  const toggleMonth = (mk: string) =>
    setCollapsed((c) =>
      c.includes(mk) ? c.filter((k) => k !== mk) : [...c, mk],
    );

  const deleteEvent = (key: string, id: string) => {
    toss();
    setEvents((prev) => {
      const list = (prev[key] ?? []).filter((e) => e.id !== id);
      const next = { ...prev };
      if (list.length) next[key] = list;
      else delete next[key];
      return next;
    });
  };

  const toggleAlarm = (key: string, id: string) => {
    const ev = (events[key] ?? []).find((e) => e.id === id);
    if (ev && !ev.alarm && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    if (ev && !ev.alarm) bellOn();
    else bellOff();
    setEvents((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((e) =>
        e.id === id ? { ...e, alarm: !e.alarm } : e,
      ),
    }));
  };

  const submitEvent = (e: FormEvent) => {
    e.preventDefault();
    const time = formTime.trim();
    const name = formName.trim();
    if (!time || !name) return;
    pluck();
    setEvents((prev) => ({
      ...prev,
      [pickedKey]: [
        ...(prev[pickedKey] ?? []),
        { id: newId(), time, name, alarm: false },
      ],
    }));
    setFormTime('');
    setFormName('');
    setFormOpen(false);
  };

  return (
    <section className="screen">
      <div className="cal-title">ALMANAQUE</div>
      <div className="cal-nav">
        <button
          className="ink-mini"
          disabled={viewOffset === -1}
          onClick={() => navigate(-1)}
        >
          ‹
        </button>
        <span>
          {MONTHS_PT[viewMonth]} {viewYear}
        </span>
        <button
          className="ink-mini"
          disabled={viewOffset === 1}
          onClick={() => navigate(1)}
        >
          ›
        </button>
      </div>
      <table className="cal">
        <thead>
          <tr>
            {DAYS.map((d, i) => (
              <th key={i}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((d, i) => {
                if (d === null) return <td key={i} className="empty" />;
                // hand-drawn circles: current day in accent, selected days in ink
                const isToday = viewOffset === 0 && d === today;
                const isPicked = d === picked;
                return (
                  <td key={i} onClick={() => pickDay(d)}>
                    {d}
                    {isPicked && !isToday && (
                      <svg className="ring sel-ring" viewBox="0 0 60 52">
                        <path d="M32 6 C 45 4, 55 14, 54 26 C 53 39, 43 48, 29 47 C 16 46, 7 38, 8 24 C 9 12, 18 7, 31 6" />
                      </svg>
                    )}
                    {isToday && (
                      <svg className="ring" viewBox="0 0 60 52">
                        <path d="M32 6 C 45 4, 55 14, 54 26 C 53 39, 43 48, 29 47 C 16 46, 7 38, 8 24 C 9 12, 18 7, 31 6" />
                      </svg>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {formOpen && (
        <form className="evform" onSubmit={submitEvent}>
          <div className="ev-note">
            Nova tarefa — {pad2(picked)}/{pad2(viewMonth + 1)}
          </div>
          <div className="evform-row">
            <input
              className="add-ink ev-time"
              type="time"
              value={formTime}
              required
              onChange={(e) => setFormTime(e.target.value)}
            />
            <input
              className="add-ink"
              value={formName}
              required
              placeholder="O que você vai fazer nesse dia…"
              onChange={(e) => setFormName(e.target.value)}
            />
            <button className="ink-link" type="submit">
              [ ADICIONAR ]
            </button>
            <button className="ink-link" type="button" onClick={() => setFormOpen(false)}>
              CANCELAR
            </button>
          </div>
        </form>
      )}

      <div className="agenda">
        <h3>Agenda</h3>
        {months.length === 0 && (
          <div className="ag-empty">Nada na agenda — clique num dia para adicionar</div>
        )}
        {months.map((mo) => {
          const mk = `${mo.y}-${mo.m}`;
          const open = !collapsed.includes(mk);
          return (
            <div className="ag-group" key={mk}>
              <button className="ag-month" onClick={() => toggleMonth(mk)}>
                <span>
                  {MONTHS_PT[(mo.m ?? 1) - 1]} {mo.y}
                </span>
                <svg
                  className={`ag-chev${open ? ' open' : ''}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div className={`ag-body${open ? '' : ' collapsed'}`}>
                <div className="ag-body-inner">
                  {mo.dates.map((g) => (
                    <div key={g.key}>
                      <div className="ag-date">
                        {pad2(g.d ?? 1)}/{pad2(mo.m ?? 1)}
                      </div>
                      {g.list.map((ev) => (
                        <div className="ag-row" key={ev.id}>
                          <div className="ag-time">{ev.time}</div>
                          <div className="ag-name">{ev.name}</div>
                          <Trash
                            onToss={(e) => {
                              e.stopPropagation();
                              deleteEvent(g.key, ev.id);
                            }}
                          />
                          <Bell
                            on={ev.alarm}
                            onToggle={(e) => {
                              e.stopPropagation();
                              toggleAlarm(g.key, ev.id);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
