import type { DeviceId } from '@/types/network';

export interface Point {
  x: number;
  y: number;
}

/** Fixed device layout for the mesh canvas. Pure data — no React, no side effects. */
export function getDeviceLayout(): Record<DeviceId, Point> {
  return {
    alice: { x: 40, y: 40 },
    charlie: { x: 380, y: 20 },
    bob: { x: 40, y: 220 },
    bridge: { x: 420, y: 220 },
  };
}

/** Linear interpolation between two points, used to place a traveling packet node. */
export function interpolatePoint(from: Point, to: Point, t: number): Point {
  const clamped = Math.min(1, Math.max(0, t));
  return {
    x: from.x + (to.x - from.x) * clamped,
    y: from.y + (to.y - from.y) * clamped,
  };
}
