interface CampfireFocusProps {
  remaining: number;
  total: number;
  running: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CampfireFocus({ remaining, total, running }: CampfireFocusProps) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 0;
  const offset = circumference * (1 - progress);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

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
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="spark" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
      </div>

      <div className="campfire-timer">
        {pad(minutes)}:{pad(seconds)}
      </div>
    </div>
  );
}
