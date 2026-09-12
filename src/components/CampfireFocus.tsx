interface CampfireFocusProps {
  elapsed: number;
  running: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CampfireFocus({ elapsed, running }: CampfireFocusProps) {
  const CYCLE = 25 * 60;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = CYCLE > 0 ? (elapsed % CYCLE) / CYCLE : 0;
  const offset = circumference * (1 - progress);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const timeText =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className={`campfire-focus${running ? ' running' : ''}`}>
      <svg className="campfire-ring" viewBox="0 0 220 220">
        <circle className="campfire-ring__track" cx="110" cy="110" r={radius} />
        <circle
          className="campfire-ring__progress"
          cx="110"
          cy="110"
          r={radius}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>

      <div className="campfire-glow" />
      <div className="campfire-logs">
        <div className="log log--left" />
        <div className="log log--right" />
        <div className="log log--back" />
      </div>
      <div className="campfire-flames">
        <div className="flame flame--outer" />
        <div className="flame flame--mid" />
        <div className="flame flame--inner" />
      </div>
      <div className="campfire-sparks">
        {Array.from({ length: running ? 3 : 6 }).map((_, i) => (
          <div
            key={i}
            className="spark"
            style={{
              animationDelay: `${i * (running ? 0.7 : 0.35)}s`,
              animationDuration: running ? '2.8s' : '2.5s',
            }}
          />
        ))}
      </div>

      <div className="campfire-timer">{timeText}</div>
    </div>
  );
}
