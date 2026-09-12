import { useMemo } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

interface StarfieldProps {
  count?: number;
  active: boolean;
}

export default function Starfield({ count = 40, active }: StarfieldProps) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, [count]);

  return (
    <div className={`starfield${active ? ' active' : ''}`} aria-hidden="true">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}
