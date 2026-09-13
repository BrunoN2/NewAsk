import { useEffect, useState } from 'react';
import TabBar, { type ScreenId } from './components/TabBar';
import InstallPrompt from './components/InstallPrompt';
import InstallModal from './components/InstallModal';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import NewsScreen from './screens/NewsScreen';
import ProfileScreen from './screens/ProfileScreen';
import './broadsheet.css';

const NIGHT_KEY = 'broadsheet.night';
const SKIP_KEY = 'nuvask.skip-install';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [night, setNight] = useState<boolean>(
    () => localStorage.getItem(NIGHT_KEY) === 'on',
  );
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    localStorage.setItem(NIGHT_KEY, night ? 'on' : 'off');
  }, [night]);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(SKIP_KEY) === 'true') return;
    setShowInstall(true);
  }, []);

  return (
    <div className={`phone${night ? ' night' : ''}`}>
      {showInstall && <InstallModal onClose={() => setShowInstall(false)} />}
      <InstallPrompt />
      {screen === 'home' && <HomeScreen />}
      {screen === 'events' && <EventsScreen />}
      {screen === 'news' && <NewsScreen />}
      {screen === 'profile' && (
        <ProfileScreen
          night={night}
          onToggleNight={() => setNight((n) => !n)}
        />
      )}
      <TabBar active={screen} onChange={setScreen} />
    </div>
  );
}
