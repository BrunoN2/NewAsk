// Daily broadsheet edition: 5 articles a day from a curated sample pool,
// rotated deterministically by the Brasília date. Swap the pool for a real
// API later if daily live news is needed (publish-safe: no keys, no network).
export type Article = {
  id: string;
  cat: string;
  headline: string;
  summary: string;
  photo: number; // sketchy photo variant
};

type PoolItem = Omit<Article, 'photo'>;

const CAT_CATASTROFES = 'Catástrofes';
const CAT_TECH = 'Tech';
const CAT_INVEST = 'Investimentos';
const CAT_MUNDO = 'Mundo';

const POOL: PoolItem[] = [
  // Catástrofes
  {
    id: 'c1',
    cat: CAT_CATASTROFES,
    headline: 'Furacões mais fortes obrigam costas a redesenhar defesas',
    summary:
      'Diques de madeira, manguezais replantados e paredões recolhidos: engenheiros e pescadores juntam saberes para segurar o mar que sobe.',
  },
  {
    id: 'c2',
    cat: CAT_CATASTROFES,
    headline: 'Onda de calor rompe rede elétrica de três estados',
    summary:
      'Rodízio de energia entra em vigor e indústrias mudam turnos para a madrugada. Prefeituras abrem "ilhas de sombra" em praças.',
  },
  {
    id: 'c3',
    cat: CAT_CATASTROFES,
    headline: 'Terremoto de magnitude 6,4 danifica ponte centenária',
    summary:
      'Não houve vítimas, mas a travessia que ligava dois bairros foi interditada. Cidade improvisa balsa de madeira enquanto a reconstrução sai.',
  },
  {
    id: 'c4',
    cat: CAT_CATASTROFES,
    headline: 'Cheias deslocam famílias de bairros ribeirinhos',
    summary:
      'Rio transbordou na madrugada. Escolas viram abrigos e mutirões empilham sacos de areia no cais.',
  },
  {
    id: 'c5',
    cat: CAT_CATASTROFES,
    headline: 'Seca recorde põe cinco cidades sob rodízio de água',
    summary:
      'Reservatórios estão no menor nível da série histórica. Caminhões-pipa atendem bairros altos e feiras passam a abrir mais cedo.',
  },

  // Tech
  {
    id: 't1',
    cat: CAT_TECH,
    headline: 'Modelo de IA traduz 200 idiomas rodando no próprio aparelho',
    summary:
      'Pesquisadores mostram tradução instantânea sem servidor central. Escolas rurais e leitórios comunitários testam em campo.',
  },
  {
    id: 't2',
    cat: CAT_TECH,
    headline: 'Computador quântico resolve em minutos problema de logística',
    summary:
      'Rotas de caminhões que levavam dias para ser otimizadas saíram em 11 minutos. Empresas de entrega querem rodar em piloto até o fim do ano.',
  },
  {
    id: 't3',
    cat: CAT_TECH,
    headline: 'Robôs domésticos aprendem tarefas observando vídeos',
    summary:
      'Sem instruções por escrito: o robô assiste, experimenta e ajusta. Famílias voluntárias relatam café servido e louça empilhada.',
  },
  {
    id: 't4',
    cat: CAT_TECH,
    headline: 'Baterias de estado sólido chegam aos primeiros veículos de série',
    summary:
      'Carregamento em 9 minutos e autonomia acima de 700 km. A fila de espera já passa do ano que vem, diz a montante.',
  },
  {
    id: 't5',
    cat: CAT_TECH,
    headline: 'Rede 6G entra em teste comercial em três metrópoles',
    summary:
      'Latência baixa o suficiente para cirurgia remota e tudo em praças responde antes de pedir, relatam os primeiros testes.',
  },

  // Investimentos
  {
    id: 'i1',
    cat: CAT_INVEST,
    headline: 'Bancos centrais mantêm juros e mercados reagem em alta',
    summary:
      'Décisão saiu tarde da noite. Praças financeiras discutem em quiosques de café se o recuo começaria no trimestre que vem.',
  },
  {
    id: 'i2',
    cat: CAT_INVEST,
    headline: 'Fundos injetam bilhões em startups de energia limpa',
    summary:
      'A rodada recorde empurra telhados solares para bairros periféricos, dizem as captadoras.',
  },
  {
    id: 'i3',
    cat: CAT_INVEST,
    headline: 'Anunciada cidade-sede para a maior fábrica de chips',
    summary:
      'O prédio ficará junto ao porto, com linha de trem própria. Estimativa: 40 mil empregos diretos em cinco anos.',
  },
  {
    id: 'i4',
    cat: CAT_INVEST,
    headline: 'IPO do ano: transporte autônomo estreia na bolsa',
    summary:
      'Frota de vans sem motorista já circula em duas cidades-piloto. Investidores de varejo puderam comprar a partir de hoje.',
  },
  {
    id: 'i5',
    cat: CAT_INVEST,
    headline: 'Criptomoedas regulamentadas em novo pacto internacional',
    summary:
      'Trocas acima de certo teto passam a declarar como investimento. Quiosques de câmbio passam a exibir as taxas no mesmo quadro do dólar.',
  },

  // Mundo
  {
    id: 'm1',
    cat: CAT_MUNDO,
    headline: 'Cidades costeiras assinam pacto contra ressacas',
    summary:
      'Doze portos compartilham boias de sensor e planos de evacuação. O apelido local: "corda que amarra o mar".',
  },
  {
    id: 'm2',
    cat: CAT_MUNDO,
    headline: 'Pacto global fecha reflorestamento de 30% até 2040',
    summary:
      'O acordo fecha metas por região, com auditoria aberta. Primeiro relatório sai no fim da estação seca.',
  },
  {
    id: 'm3',
    cat: CAT_MUNDO,
    headline: 'Universidades públicas abrem cursos noturnos de tecnologia',
    summary:
      'Horário pensado para quem trabalha de dia. As turmas começam cheias e laboratórios ficam abertos até as 23h.',
  },
  {
    id: 'm4',
    cat: CAT_MUNDO,
    headline: 'Estações de trem viram praças de leitura em cinco países',
    summary:
      'Prateleiras abertas no saguão, jornais do dia e bancos de madeira. Ferroviários relatam passageiros perdendo o horário por causa de livros.',
  },
  {
    id: 'm5',
    cat: CAT_MUNDO,
    headline: 'Coretos voltam a abrigar rádio comunitária em praças',
    summary:
      'Sem servidor central: a transmissão sai do coreto mesmo. Ouvintes ligam pedindo música e notícias do bairro.',
  },
];

const PER_DAY = 5;

const dayOfYear = (d: Date) =>
  Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);

export function dailyArticles(date = new Date()): Article[] {
  const start = dayOfYear(date) * PER_DAY;
  return Array.from({ length: PER_DAY }, (_, i) => {
    const item = POOL[(start + i * 7) % POOL.length];
    return { ...item, photo: (start + i * 7) % 4 };
  });
}

export function editionDate(date = new Date()): string {
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
  }).format(date);
  const day = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
  return `${weekday} — ${day}`;
}

// ===== real news: G1 RSS via r.jina.ai (keyless, CORS-free) with a
// Google News RSS via allorigins fallback; local sample pool is the last resort
export type EditionArticle = {
  id: string;
  cat: string;
  headline: string;
  summary: string;
  photo: number;
  link?: string;
  source?: string;
  time?: string;
};

const JINA = 'https://r.jina.ai/';
const PROXY = 'https://api.allorigins.win/raw?url=';

const topicUrl = (t: string) =>
  `https://news.google.com/rss/headlines/section/topic/${t}?hl=pt-BR&gl=BR&ceid=BR:pt-419`;

const searchUrl = (q: string) =>
  `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

const CATS: Array<{ cat: string; g1: string; gn: string }> = [
  {
    cat: CAT_CATASTROFES,
    g1: 'https://g1.globo.com/rss/g1/natureza/',
    gn: searchUrl('desastres'),
  },
  {
    cat: CAT_TECH,
    g1: 'https://g1.globo.com/rss/g1/tecnologia/',
    gn: topicUrl('TECHNOLOGY'),
  },
  {
    cat: CAT_INVEST,
    g1: 'https://g1.globo.com/rss/g1/economia/',
    gn: searchUrl('investimentos'),
  },
  {
    cat: CAT_MUNDO,
    g1: 'https://g1.globo.com/rss/g1/mundo/',
    gn: topicUrl('WORLD'),
  },
];

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const stripHtml = (s: string) =>
  s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// r.jina.ai converts the RSS to markdown: "### [headline](link)" + text lines
function parseMd(md: string, cat: string): EditionArticle[] {
  const chunks = md.split(/###\s*\[/).slice(1);
  const out: EditionArticle[] = [];
  for (const chunk of chunks) {
    const m = chunk.match(/^([^\]]+)\]\(([^)\s]+)\)/);
    if (!m) continue;
    const headline = m[1].trim();
    const link = m[2].trim();
    if (headline.length < 15 || !link.includes('globo.com')) continue;
    if (link.includes('planeta-bizarro')) continue;
    const summary =
      chunk
        .slice(m[0].length)
        .split(/\n+/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('![') && !l.startsWith('['))
        .join(' ')
        .slice(0, 220) || 'Toque para abrir a matéria no site de origem.';
    out.push({
      id: `r${hash(link)}`,
      cat,
      headline,
      summary,
      photo: hash(link) % 4,
      link,
      source: 'G1',
    });
  }
  return out;
}

async function fetchViaJina(cat: string, g1: string): Promise<EditionArticle[]> {
  const res = await fetch(JINA + g1, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(String(res.status));
  const arts = parseMd(await res.text(), cat).slice(0, 8);
  if (!arts.length) throw new Error('no items');
  return arts;
}

async function fetchViaProxy(cat: string, gn: string): Promise<EditionArticle[]> {
  const res = await fetch(PROXY + encodeURIComponent(gn), {
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(String(res.status));
  const xml = new DOMParser().parseFromString(await res.text(), 'text/xml');
  const arts = Array.from(xml.querySelectorAll('item'))
    .slice(0, 8)
    .map((item) => {
      const title = item.querySelector('title')?.textContent ?? '';
      const link = item.querySelector('link')?.textContent ?? '';
      const source = item.querySelector('source')?.textContent ?? '';
      const pub = item.querySelector('pubDate')?.textContent ?? '';
      const time = pub
        ? new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(pub))
        : '';
      const headline = title.replace(/\s-\s[^-]+$/, '').trim();
      const summary =
        stripHtml(item.querySelector('description')?.textContent ?? '').slice(0, 220) ||
        'Toque para abrir a matéria no site de origem.';
      return {
        id: `r${hash(link)}`,
        cat,
        headline,
        summary,
        photo: hash(link) % 4,
        link,
        source,
        time,
      };
    })
    .filter((a) => a.headline);
  if (!arts.length) throw new Error('no items');
  return arts;
}

// per category: G1 via jina first, Google News via allorigins as fallback
async function fetchCategory(cat: string, g1: string, gn: string): Promise<EditionArticle[]> {
  try {
    return await fetchViaJina(cat, g1);
  } catch {
    return fetchViaProxy(cat, gn);
  }
}

// round-robin across the four categories: 5 articles, covering as many as possible
export async function fetchRealNews(): Promise<EditionArticle[]> {
  const settled = await Promise.allSettled(
    CATS.map((c) => fetchCategory(c.cat, c.g1, c.gn)),
  );
  const lists = settled
    .filter((s): s is PromiseFulfilledResult<EditionArticle[]> => s.status === 'fulfilled')
    .map((s) => s.value)
    .filter((l) => l.length);
  if (!lists.length) return [];
  const idx = lists.map(() => 0);
  const out: EditionArticle[] = [];
  while (out.length < 5) {
    let added = false;
    lists.forEach((l, li) => {
      if (out.length < 5 && idx[li] < l.length) {
        out.push(l[idx[li]++]);
        added = true;
      }
    });
    if (!added) break;
  }
  return out;
}

// ===== 24h edition cache: fetch once a day, serve the saved edition otherwise
const CACHE_KEY = 'broadsheet.news';

export function getCachedEdition(): { arts: EditionArticle[]; at: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { arts: EditionArticle[]; at: number };
      if (Array.isArray(parsed.arts) && parsed.arts.length) return parsed;
    }
  } catch {
    /* ignore corrupted cache */
  }
  return null;
}

export function saveEdition(arts: EditionArticle[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ arts, at: Date.now() }));
  } catch {
    /* ignore quota errors */
  }
}

// edition is considered fresh (no refetch) within 24h
export const EDITION_TTL_MS = 86400000;
