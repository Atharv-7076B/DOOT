import { motion, useReducedMotion } from 'framer-motion';

const POINTS: Array<{ x: number; y: number; color: string }> = [
  { x: 80, y: 90, color: 'hsl(var(--mesh-blue))' },
  { x: 80, y: 290, color: 'hsl(var(--mesh-cyan))' },
  { x: 300, y: 60, color: 'hsl(var(--mesh-purple))' },
  { x: 380, y: 220, color: 'hsl(var(--mesh-blue))' },
  { x: 230, y: 340, color: 'hsl(var(--mesh-green))' },
];
const LINKS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [1, 4],
  [3, 4],
];

/** Purely ambient — communicates "this is a live mesh" at a glance, no data behind it. */
export function HeroMesh() {
  const reduceMotion = useReducedMotion();

  return (
    <svg viewBox="0 0 460 420" className="relative z-10 h-full w-full" aria-hidden="true">
      {LINKS.map(([a, b], i) => {
        const from = POINTS[a]!;
        const to = POINTS[b]!;
        return (
          <line
            key={i}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {POINTS.map((point, i) => (
        <g key={i}>
          <motion.circle
            cx={point.x}
            cy={point.y}
            r={14}
            fill="none"
            stroke={point.color}
            strokeWidth={1}
            opacity={0.25}
            animate={reduceMotion ? undefined : { r: [8, 22], opacity: [0.4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
          />
          <motion.circle
            cx={point.x}
            cy={point.y}
            r={5}
            fill={point.color}
            animate={reduceMotion ? undefined : { r: [5, 7, 5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        </g>
      ))}

      {!reduceMotion &&
        LINKS.map(([a, b], i) => {
          const from = POINTS[a]!;
          const to = POINTS[b]!;
          return (
            <motion.circle
              key={`packet-${i}`}
              r={3.2}
              fill="#fff"
              animate={{ cx: [from.x, to.x], cy: [from.y, to.y] }}
              transition={{ duration: 3 + i * 0.6, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
            />
          );
        })}
    </svg>
  );
}
