import { useEffect, useRef, useState } from 'react';

/**
 * Counts down from `seconds`, ticking every `tickMs`, and invokes `onComplete`
 * then restarts. Returns the current remaining seconds.
 */
export function useCountdown(seconds: number, tickMs: number, onComplete: () => void): number {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemaining((current) => {
        const next = current - tickMs / 1000;
        if (next <= 0) {
          onCompleteRef.current();
          return seconds;
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(intervalId);
  }, [seconds, tickMs]);

  return remaining;
}
