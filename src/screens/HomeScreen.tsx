import { useEffect, useRef, useState } from 'react';
import { addFocused, bumpCompleted, bumpStreak } from '../stats';
import { taskDone, taskUndo, pluck, startMorningAmbience, stopMorningAmbience } from '../audio';
import CampfireFocus from '../components/CampfireFocus';
import Starfield from '../components/Starfield';

type Task = { id: string; label: string; done: boolean };
type Category = { name: string; tasks: Task[] };

let seq = 0;
const newId = () =>
  `t${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const INITIAL: Category[] = [
  {
    name: 'Personal',
    tasks: [
      { id: newId(), label: 'Meditar 10 minutos', done: false },
      { id: newId(), label: 'Ligar para a vovó', done: false },
    ],
  },
  {
    name: 'Study',
    tasks: [
      { id: newId(), label: 'Ler capítulo 4 de História', done: false },
      { id: newId(), label: 'Resolver 5 exercícios de cálculo', done: false },
    ],
  },
  {
    name: 'Work',
    tasks: [
      { id: newId(), label: 'Responder e-mails do cliente', done: false },
      { id: newId(), label: 'Revisar proposta de projeto', done: false },
    ],
  },
  {
    name: 'Food',
    tasks: [{ id: newId(), label: 'Planejar o jantar da semana', done: false }],
  },
];

const STORAGE_KEY = 'broadsheet.tasks';

function loadTasks(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Category[];
      // additive migration: ensure every stored task has a stable id
      // done tasks self-remove after the conclusion animation;
      // drop any stored as done (e.g. app closed mid-animation)
      return parsed.map((cat) => ({
        ...cat,
        tasks: cat.tasks
          .filter((t) => !t.done)
          .map((t) => ({ ...t, id: t.id ?? newId() })),
      }));
    }
  } catch {
    /* ignore corrupted storage */
  }
  return INITIAL;
}

export default function HomeScreen() {
  const [cats, setCats] = useState<Category[]>(loadTasks);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [editing, setEditing] = useState<{ c: number; i: number } | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [removing, setRemoving] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const wakeRef = useRef<{ release: () => Promise<void> } | null>(null);

  type Sentinel = {
    addEventListener?: (type: 'release', fn: () => void) => void;
    removeEventListener?: (type: 'release', fn: () => void) => void;
    release: () => Promise<void>;
  };

  const wakeSupported = () =>
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const acquireWake = async () => {
    if (!wakeSupported() || wakeRef.current) return;
    try {
      const wl = (navigator as unknown as {
        wakeLock: { request: (t: 'screen') => Promise<Sentinel> };
      }).wakeLock;
      const sent = await wl.request('screen');
      // the browser releases the sentinel on its own when the page hides
      sent.addEventListener?.('release', () => {
        wakeRef.current = null;
      });
      wakeRef.current = sent;
    } catch {
      /* system or user declined — focus works anyway */
    }
  };

  const releaseWake = () => {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  };

  const accumulateFocus = () => {
    if (startedAtRef.current !== null) {
      addFocused(Date.now() - startedAtRef.current);
      startedAtRef.current = null;
    }
  };

  useEffect(() => {
    bumpStreak();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  }, [cats]);

  useEffect(() => {
    if (running) {
      intervalRef.current = window.setInterval(
        () => setElapsed((e) => e + 1),
        1000,
      );
    }
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    document.querySelector('.phone')?.classList.toggle('focus-night', running);
  }, [running]);

  useEffect(
    () => () => {
      if (startedAtRef.current !== null) {
        addFocused(Date.now() - startedAtRef.current);
        startedAtRef.current = null;
      }
      stopMorningAmbience();
      releaseWake();
      document.querySelector('.phone')?.classList.remove('focus-night');
    },
    [],
  );

  // re-acquire the wake lock when the user returns and the focus is on
  useEffect(() => {
    if (!wakeSupported()) return;
    const onVis = () => {
      if (document.visibilityState === 'visible' && startedAtRef.current !== null) {
        void acquireWake();
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const REMOVAL_MS = 600;

  const toggleTask = (catIdx: number, taskIdx: number) => {
    const task = cats[catIdx]?.tasks[taskIdx];
    if (!task || removing.includes(task.id)) return;
    const justDone = !task.done;
    if (justDone) { bumpCompleted(); taskDone(); }
    else taskUndo();
    setCats((prev) =>
      prev.map((cat, c) =>
        c === catIdx
          ? {
              ...cat,
              tasks: cat.tasks.map((t, i) =>
                i === taskIdx ? { ...t, done: justDone } : t,
              ),
            }
          : cat,
      ),
    );
    if (justDone) {
      setRemoving((r) => [...r, task.id]);
      window.setTimeout(() => {
        setRemoving((r) => r.filter((id) => id !== task.id));
        setCats((prev) =>
          prev.map((cat, c) =>
            c === catIdx
              ? { ...cat, tasks: cat.tasks.filter((t) => t.id !== task.id) }
              : cat,
          ),
        );
      }, REMOVAL_MS);
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    const text = draft.trim();
    if (text) {
      setCats((prev) =>
        prev.map((cat, c) =>
          c === editing.c
            ? {
                ...cat,
                tasks: cat.tasks.map((t, i) =>
                  i === editing.i ? { ...t, label: text } : t,
                ),
              }
            : cat,
        ),
      );
    }
    setEditing(null);
  };

  const startEdit = (c: number, i: number, label: string) => {
    setAdding(null);
    setEditing({ c, i });
    setDraft(label);
  };

  const submitNewTask = (c: number) => {
    const text = newTask.trim();
    if (text) {
      pluck();
      setCats((prev) =>
        prev.map((cat, ci) =>
          ci === c
            ? { ...cat, tasks: [...cat.tasks, { id: newId(), label: text, done: false }] }
            : cat,
        ),
      );
    }
    setNewTask('');
    setAdding(null);
  };

  const startAdd = (c: number) => {
    setEditing(null);
    setAdding(c);
    setNewTask('');
  };

  const firstPending =
    cats.flatMap((c) => c.tasks).find((t) => !t.done)?.label ?? null;

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();

  const hourBr = Number(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
  ) % 24;
  const kickerLabel =
    hourBr >= 5 && hourBr < 12
      ? 'Foco da Manhã'
      : hourBr >= 12 && hourBr < 18
        ? 'Foco da Tarde'
        : 'Foco da Noite';

  return (
    <section className="screen">
      <Starfield active={running} />
      <header className="masthead">
        <h1>O FOCO</h1>
        <div className="dateline">
          <span>{today}</span>
        </div>
      </header>

      <div className="focusbox">
        <div className="kicker">{kickerLabel}</div>
        <div className="task">{firstPending ?? 'Sem tarefas na fila — adicione uma'}</div>
        <CampfireFocus elapsed={elapsed} running={running} />
        <button
          className="btn-ink"
          onClick={() => {
            if (running) {
              accumulateFocus();
              stopMorningAmbience();
              releaseWake();
            } else {
              startedAtRef.current = Date.now();
              startMorningAmbience();
              void acquireWake();
            }
            setRunning((r) => !r);
          }}
        >
          [ {running ? 'PAUSAR' : 'INICIAR'} FOCO ]
        </button>
      </div>

      {cats.map((cat, c) => {
        const done = cat.tasks.filter((t) => t.done).length;
        return (
          <div className="cat" key={cat.name}>
            <h3>
              <span>
                {cat.name}
                <small>
                  {done}/{cat.tasks.length}
                </small>
              </span>
              <button
                className="ink-mini"
                title="Adicionar tarefa"
                onClick={() => startAdd(c)}
              >
                ＋
              </button>
            </h3>
            {cat.tasks.map((task, i) => {
              const isEditing = editing?.c === c && editing?.i === i;
              return (
                <div
                  key={task.id}
                  className={`taskrow${task.done ? ' done' : ''}${
                    removing.includes(task.id) ? ' removing' : ''
                  }`}
                  onClick={() => toggleTask(c, i)}
                >
                  <div className="box">
                    <svg viewBox="0 0 24 24">
                      <path d="M4 13l5 5L20 7" />
                    </svg>
                  </div>
                  {isEditing ? (
                    <input
                      className="edit-ink"
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={saveEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') setEditing(null);
                      }}
                    />
                  ) : (
                    <div
                      className="label"
                      title="Editar tarefa"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(c, i, task.label);
                      }}
                    >
                      {task.label}
                    </div>
                  )}
                </div>
              );
            })}
            {adding === c && (
              <form
                className="addrow"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitNewTask(c);
                }}
              >
                <input
                  className="add-ink"
                  value={newTask}
                  autoFocus
                  placeholder="Nova tarefa…"
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setNewTask('');
                      setAdding(null);
                    }
                  }}
                />
                <button className="ink-link" type="submit">
                  [ ADICIONAR ]
                </button>
                <button
                  className="ink-link"
                  type="button"
                  onClick={() => {
                    setNewTask('');
                    setAdding(null);
                  }}
                >
                  CANCELAR
                </button>
              </form>
            )}
          </div>
        );
      })}
    </section>
  );
}
