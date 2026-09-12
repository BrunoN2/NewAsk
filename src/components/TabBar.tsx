import { tap } from '../audio';
export type ScreenId = 'home' | 'events' | 'news' | 'profile';

const ICONS: Record<ScreenId, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  events: <><rect x="3" y="4" width="18" height="17" /><path d="M3 9h18M8 2v4M16 2v4" /></>,
  news: <><path d="M4 4h13v16H4zM17 8h3v12h-3M7 8h7M7 12h7M7 16h4" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
};

const LABELS: Record<ScreenId, string> = {
  home: 'Home',
  events: 'Events',
  news: 'News',
  profile: 'Profile',
};

const SCREENS: ScreenId[] = ['home', 'events', 'news', 'profile'];

export default function TabBar({
  active,
  onChange,
}: {
  active: ScreenId;
  onChange: (s: ScreenId) => void;
}) {
  return (
    <nav className="tabbar">
      {SCREENS.map((s) => (
        <button
          key={s}
          className={`tab${active === s ? ' active' : ''}`}
          onClick={() => {
            tap();
            onChange(s);
          }}
        >
          <svg viewBox="0 0 24 24">{ICONS[s]}</svg>
          <span>{LABELS[s]}</span>
        </button>
      ))}
      {/* fluid sliding marker: glides under the active tab */}
      <span
        className="tab-marker"
        style={{ left: `calc(${SCREENS.indexOf(active)} * 25% + 12.5%)` }}
      />
    </nav>
  );
}
