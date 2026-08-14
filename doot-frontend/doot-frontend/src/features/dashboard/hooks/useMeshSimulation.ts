import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnimatedPacket } from '@/components/organisms/mesh-graph/types';
import { formatCurrency, formatCurrencyDelta, randomHex, truncateHash } from '@/lib/format';
import {
  DEVICE_ROSTER,
  MAX_PACKET_TTL,
  PACKET_SPAWN_INTERVAL_MS,
  SETTLEMENT_INTERVAL_SECONDS,
} from '@/lib/constants';
import { useCountdown } from '@/hooks/useCountdown';
import type { DeviceId, DeviceProfile, LogEntry, LogTag, NetworkMetrics, SimulatedPacket } from '@/types/network';

const SENDER_CANDIDATES: DeviceId[] = ['alice', 'bob', 'charlie'];
const RELAY_HUB: DeviceId = 'bob';
const LEG_DURATION_MS = 900;

interface UseMeshSimulationOptions {
  /** invoked once per completed settlement batch, e.g. to fire a toast */
  onSettlementBatch?: (amount: number) => void;
}

export function useMeshSimulation({ onSettlementBatch }: UseMeshSimulationOptions = {}) {
  const [devices, setDevices] = useState<Record<DeviceId, DeviceProfile>>(() => structuredClone(DEVICE_ROSTER));
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<SimulatedPacket[]>([]);
  const [animatedPackets, setAnimatedPackets] = useState<AnimatedPacket[]>([]);
  const [relayingDeviceIds, setRelayingDeviceIds] = useState<Set<DeviceId>>(new Set());
  const [recentlySettledIds, setRecentlySettledIds] = useState<Set<DeviceId>>(new Set());
  const [cumulative, setCumulative] = useState({ volumeRouted: 0, hopSum: 0, hopCount: 0 });
  const [batchVolume, setBatchVolume] = useState(0);

  const packetSeqRef = useRef(1);
  const timeoutIdsRef = useRef<number[]>([]);
  const rafIdsRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);

  useEffect(
    () => () => {
      isMountedRef.current = false;
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      rafIdsRef.current.forEach((id) => window.cancelAnimationFrame(id));
    },
    [],
  );

  const schedule = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(() => {
      if (isMountedRef.current) fn();
    }, delayMs);
    timeoutIdsRef.current.push(id);
  }, []);

  const pushLog = useCallback((tag: LogTag, message: string) => {
    setLogs((current) => {
      const entry: LogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, tag, message, timestamp: Date.now() };
      return [entry, ...current].slice(0, 40);
    });
  }, []);

  /** Animates one hop of a packet's journey from `from` to `to`, driving MeshGraph via state. */
  const animateHop = useCallback(
    (packetId: string, from: DeviceId, to: DeviceId, color: string, durationMs: number, onDone: () => void) => {
      const start = performance.now();
      const step = (time: number) => {
        if (!isMountedRef.current) return;
        const t = Math.min(1, (time - start) / durationMs);
        setAnimatedPackets((current) => {
          const others = current.filter((p) => p.id !== packetId);
          return t < 1 ? [...others, { id: packetId, from, to, progress: t, color }] : others;
        });
        if (t < 1) {
          const rafId = window.requestAnimationFrame(step);
          rafIdsRef.current.push(rafId);
        } else {
          onDone();
        }
      };
      const rafId = window.requestAnimationFrame(step);
      rafIdsRef.current.push(rafId);
    },
    [],
  );

  const spawnPacket = useCallback(() => {
    const from = SENDER_CANDIDATES[Math.floor(Math.random() * SENDER_CANDIDATES.length)] as DeviceId;
    const toCandidates = SENDER_CANDIDATES.filter((id) => id !== from);
    const to = toCandidates[Math.floor(Math.random() * toCandidates.length)] as DeviceId;
    const amount = Math.floor(Math.random() * 900) + 50;
    const hopBudgetUsed = Math.floor(Math.random() * 3) + 1;
    const hash = `${randomHex(8)}${randomHex(4)}`;
    const packetId = `pk-${packetSeqRef.current++}`;
    const color = `hsl(${{ alice: 221, bob: 187, charlie: 271, bridge: 140 }[from]}, 85%, 60%)`;

    const packet: SimulatedPacket = {
      id: packetId,
      hash,
      from,
      to,
      currentHolder: from,
      amount,
      ttl: MAX_PACKET_TTL - hopBudgetUsed,
      maxTtl: MAX_PACKET_TTL,
      hopCount: hopBudgetUsed,
      status: 'encrypting',
      createdAt: Date.now(),
    };

    // Debit sender immediately — optimistic, matches the optimistic-locking ledger model.
    setDevices((current) => ({ ...current, [from]: { ...current[from], balance: current[from].balance - amount } }));
    setCumulative((c) => ({ volumeRouted: c.volumeRouted + amount, hopSum: c.hopSum + hopBudgetUsed, hopCount: c.hopCount + 1 }));
    setQueue((current) => [packet, ...current].slice(0, 10));

    pushLog('crypto', `packet ${truncateHash(hash)} encrypted (AES-256, key wrapped)`);

    // Hop 1: sender -> relay hub
    setRelayingDeviceIds((current) => new Set(current).add(RELAY_HUB));
    animateHop(packetId, from, RELAY_HUB, color, LEG_DURATION_MS, () => {
      pushLog('relay', `${DEVICE_ROSTER[from].name} → Bob : relayed, TTL ${MAX_PACKET_TTL - hopBudgetUsed + 1}→${MAX_PACKET_TTL - hopBudgetUsed}`);

      // Hop 2: relay hub -> bridge
      animateHop(packetId, RELAY_HUB, 'bridge', color, LEG_DURATION_MS, () => {
        setRelayingDeviceIds((current) => {
          const next = new Set(current);
          next.delete(RELAY_HUB);
          return next;
        });
        pushLog('info', `Bob → Bridge : forwarding ${formatCurrency(amount)}`);
        setBatchVolume((v) => v + amount);

        schedule(() => {
          pushLog('ok', `settled: ${from} → ${to} · ${formatCurrencyDelta(amount)}`);
          setDevices((current) => ({ ...current, [to]: { ...current[to], balance: current[to].balance + amount } }));
          setRecentlySettledIds((current) => new Set(current).add(to));
          schedule(() => {
            setRecentlySettledIds((current) => {
              const next = new Set(current);
              next.delete(to);
              return next;
            });
          }, 900);
          setQueue((current) => current.filter((p) => p.id !== packetId));
        }, 300);
      });
    });
  }, [animateHop, pushLog, schedule]);

  useEffect(() => {
    const intervalId = window.setInterval(spawnPacket, PACKET_SPAWN_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [spawnPacket]);

  const handleSettlementComplete = useCallback(() => {
    onSettlementBatch?.(batchVolume);
    setBatchVolume(0);
  }, [batchVolume, onSettlementBatch]);

  const secondsUntilNextBatch = useCountdown(SETTLEMENT_INTERVAL_SECONDS, 100, handleSettlementComplete);

  const metrics: NetworkMetrics = useMemo(
    () => ({
      packetsInTransit: animatedPackets.length,
      totalVolumeRouted: cumulative.volumeRouted,
      averageHopCount: cumulative.hopCount === 0 ? 0 : cumulative.hopSum / cumulative.hopCount,
      activeDeviceCount: Object.values(devices).filter((d) => !d.isBridge).length,
    }),
    [animatedPackets.length, cumulative, devices],
  );

  return {
    devices,
    logs,
    queue,
    animatedPackets,
    relayingDeviceIds,
    recentlySettledIds,
    metrics,
    settlement: {
      secondsUntilNextBatch,
      batchIntervalSeconds: SETTLEMENT_INTERVAL_SECONDS,
      queuedForSettlement: queue.length,
      lastSettlementAt: null as number | null,
    },
  };
}
