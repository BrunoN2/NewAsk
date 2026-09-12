import { renderToStaticMarkup } from 'react-dom/server';
import App from './src/App';
import HomeScreen from './src/screens/HomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import NewsScreen from './src/screens/NewsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// minimal localStorage shim for SSR smoke test
const store = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
};

const html = (el: React.ReactElement) => renderToStaticMarkup(el);

const checks: Array<[string, boolean]> = [
  ['App: masthead', html(<App />).includes('O FOCO')],
  ['App: tabbar labels', ['Home', 'Events', 'News', 'Profile'].every((l) => html(<App />).includes(l))],
  ['Home: timer', html(<HomeScreen />).includes('25:00')],
  ['Home: focus button', html(<HomeScreen />).includes('INICIAR FOCO')],
  ['Home: task category', html(<HomeScreen />).includes('Personal')],
  ['Events: calendar grid', html(<EventsScreen />).includes('ALMANAQUE')],
  ['Events: agenda empty', html(<EventsScreen />).includes('Nada na agenda — clique num dia para adicionar')],
  ['Events: single arrow', html(<EventsScreen />).includes('›')],
  ['News: daily edition', html(<NewsScreen />).includes('Edição de')],
  ['News: 5 articles', (html(<NewsScreen />).match(/headline/g) || []).length >= 5],
  ['News: lead story', html(<NewsScreen />).includes('headline lead')],
  ['News: captions', (html(<NewsScreen />).match(/foto: reda..o/g) || []).length === 5],
  ['News: divider photo', html(<NewsScreen />).includes('photo')],
  ['Profile: stats', html(<ProfileScreen night={false} onToggleNight={() => {}} />).includes('Horas em Foco')],
  ['Profile: night toggle', html(<ProfileScreen night={false} onToggleNight={() => {}} />).includes('NIGHT EDITION')],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length > 0) {
  console.error('FAIL:', failed.map(([n]) => n).join(', '));
  process.exit(1);
}
console.log(`SSR OK — App + 4 screens render, all ${checks.length} content checks passed`);
