import { useEffect, useState } from 'react';
import {
  dailyArticles,
  editionDate,
  fetchRealNews,
  getCachedEdition,
  saveEdition,
  EDITION_TTL_MS,
  type EditionArticle,
} from '../news';
import { bumpArticle, getStats } from '../stats';
import { read as readSound } from '../audio';

const PALETTE_A = ['#c9c5ba', '#8a867c', '#6e6a60'];
const PALETTE_B = ['#b5b1a6', '#4a4740', '#201e1b'];

// sketchy photojournalism placeholder, 4 variants
function SketchPhoto({ variant }: { variant: number }) {
  const p = variant % 2 === 0 ? PALETTE_A : PALETTE_B;
  return (
    <div className="photo">
      <svg viewBox="0 0 350 210" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={`dots${variant}`} width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="#1a1a1a" />
          </pattern>
        </defs>
        <rect width="350" height="210" fill={p[0]} />
        <rect y="120" width="350" height="90" fill={p[1]} />
        {variant % 4 === 0 && (
          <>
            <rect x="30" y="60" width="55" height="150" fill={`url(#dots${variant})`} opacity=".55" />
            <rect x="110" y="30" width="70" height="180" fill={`url(#dots${variant})`} opacity=".75" />
            <rect x="205" y="75" width="48" height="135" fill={`url(#dots${variant})`} opacity=".4" />
            <circle cx="330" cy="28" r="16" fill={p[2]} />
          </>
        )}
        {variant % 4 === 1 && (
          <>
            <rect x="45" y="45" width="26" height="120" fill={p[0]} opacity=".8" />
            <rect x="90" y="45" width="26" height="120" fill={p[0]} opacity=".55" />
            <rect x="135" y="45" width="26" height="120" fill={p[0]} opacity=".65" />
            <rect x="45" y="150" width="251" height="14" fill={p[2]} />
          </>
        )}
        {variant % 4 === 2 && (
          <>
            <rect x="60" y="90" width="230" height="10" fill={p[2]} />
            <rect x="60" y="120" width="150" height="10" fill={p[2]} />
            <rect x="60" y="150" width="190" height="10" fill={p[2]} />
            <rect x="270" y="40" width="30" height="90" fill={`url(#dots${variant})`} opacity=".6" />
          </>
        )}
        {variant % 4 === 3 && (
          <>
            <rect x="40" y="70" width="120" height="100" fill={`url(#dots${variant})`} opacity=".5" />
            <rect x="200" y="40" width="110" height="130" fill={`url(#dots${variant})`} opacity=".7" />
            <rect y="180" width="350" height="30" fill={p[2]} />
          </>
        )}
      </svg>
    </div>
  );
}

function ArticleBlock({
  art,
  lead,
  read,
  onRead,
}: {
  art: EditionArticle;
  lead: boolean;
  read: boolean;
  onRead: (id: string) => void;
}) {
  const cap = art.source
    ? `${art.cat} — ${art.source}${art.time ? ` · ${art.time}` : ''}${read ? ' · lida' : ''}`
    : `${art.cat} — foto: redação${read ? ' · lida' : ''}.`;

  const open = () => {
    readSound();
    onRead(art.id);
    if (art.link) window.open(art.link, '_blank', 'noopener');
  };

  return (
    <div
      style={{ cursor: 'pointer' }}
      title={art.link ? 'Abrir a matéria no site de origem' : 'Marcar matéria como lida'}
      onClick={open}
    >
      <SketchPhoto variant={art.photo} />
      <div className="caption">{cap}</div>
      <h2 className={`headline${lead ? ' lead' : ''}`}>
        {art.headline}
        {read && <span className="read-tag">LIDA</span>}
      </h2>
      <p className="summary">{art.summary}</p>
    </div>
  );
}

export default function NewsScreen() {
  const [readIds, setReadIds] = useState<string[]>(() => getStats().articles);
  // cached real edition if saved; else the local sample edition
  const [real, setReal] = useState<EditionArticle[] | null>(() => getCachedEdition()?.arts ?? null);
  const [live, setLive] = useState(() => getCachedEdition() !== null);

  // the edition updates every 24h: a fresh cache is served as is; when it
  // completes the TTL (or does not exist), refetch in the background
  useEffect(() => {
    const cached = getCachedEdition();
    if (cached && Date.now() - cached.at < EDITION_TTL_MS) return;
    let alive = true;
    fetchRealNews()
      .then((arts) => {
        if (alive && arts.length) {
          saveEdition(arts);
          setReal(arts);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const articles: EditionArticle[] = real ?? dailyArticles();
  const [lead, ...rest] = articles;

  const markRead = (id: string) => {
    bumpArticle(id);
    setReadIds((r) => (r.includes(id) ? r : [...r, id]));
  };

  const read = (id: string) => readIds.includes(id);
  const readCount = articles.filter((a) => read(a.id)).length;

  return (
    <section className="screen">
      <div className="news-kicker">
        Edição de {editionDate()}
        {live && <span className="live-tag"> · AO VIVO</span>} — {readCount}/{articles.length} lidas
      </div>

      <div style={{ marginTop: 12 }}>
        <ArticleBlock art={lead} lead read={read(lead.id)} onRead={markRead} />
      </div>

      <div className="news-divider" />

      {rest.map((art) => (
        <div key={art.id}>
          <ArticleBlock art={art} lead={false} read={read(art.id)} onRead={markRead} />
          <div className="news-divider" />
        </div>
      ))}
    </section>
  );
}
