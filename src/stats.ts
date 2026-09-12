// Usage stats (zeroed by default) persisted in localStorage.
export type Stats = {
  focusedMs: number;
  completed: number;
  streak: number;
  lastDay: string; // 'YYYY-MM-DD'
  articles: string[];
};

const KEY = 'broadsheet.stats';

const pad = (n: number) => String(n).padStart(2, '0');

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function read(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Stats;
  } catch {
    /* ignore corrupted storage */
  }
  return { focusedMs: 0, completed: 0, streak: 0, lastDay: '', articles: [] };
}

function write(s: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

export function getStats(): Stats {
  return read();
}

export function addFocused(ms: number) {
  if (ms <= 0) return;
  const s = read();
  s.focusedMs += ms;
  write(s);
}

export function bumpCompleted() {
  const s = read();
  s.completed += 1;
  write(s);
}

// consecutive days using the app: yesterday -> streak + 1, otherwise restart at 1
export function bumpStreak() {
  const s = read();
  const today = dayKey(new Date());
  if (s.lastDay === today) return;
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  s.streak = s.lastDay === yesterday ? s.streak + 1 : 1;
  s.lastDay = today;
  write(s);
}

export function bumpArticle(id: string) {
  const s = read();
  if (s.articles.includes(id)) return;
  s.articles.push(id);
  write(s);
}
