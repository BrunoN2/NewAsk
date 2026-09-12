import { useEffect, useState } from 'react';
import TabBar, { type ScreenId } from './components/TabBar';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import NewsScreen from './screens/NewsScreen';
import ProfileScreen from './screens/ProfileScreen';
import './broadsheet.css';

const NIGHT_KEY = 'broadsheet.night';

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home');
  const [night, setNight] = useState<boolean>(
    () => localStorage.getItem(NIGHT_KEY) === 'on',
  );

  useEffect(() => {
    localStorage.setItem(NIGHT_KEY, night ? 'on' : 'off');
  }, [night]);

  return (
    <div className={`phone${night ? ' night' : ''}`}>
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
