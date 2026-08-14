import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AnimatedPacket } from '@/components/organisms/mesh-graph/types';
import { formatCurrency } from '@/lib/format';
import {
  DEVICE_ROSTER,
  SETTLEMENT_INTERVAL_SECONDS,
} from '@/lib/constants';
import { useCountdown } from '@/hooks/useCountdown';
import type { DeviceId, LogEntry, LogTag, NetworkMetrics, SimulatedPacket } from '@/types/network';
import { useMeshState } from '@/api/useMeshState';
import { apiFetch } from '@/api/client';
import type { MeshGraphDevice } from '@/components/organisms/mesh-graph/MeshGraph';
import type { MeshPacketDto, VirtualDeviceDto } from '@/types/api';

const LEG_DURATION_MS = 750;

interface UseMeshSimulationOptions {
  /** invoked once per completed settlement batch, e.g. to fire a toast */
  onSettlementBatch?: (amount: number) => void;
}

export function useMeshSimulation({ onSettlementBatch }: UseMeshSimulationOptions = {}) {
  // Poll real backend mesh state every 800ms
  const meshQuery = useMeshState({ refetchIntervalMs: 800 });

  const [devices, setDevices] = useState<Record<string, MeshGraphDevice>>(() => {
    const initial: Record<string, MeshGraphDevice> = {};
    Object.entries(DEVICE_ROSTER).forEach(([id, p]) => {
      initial[id] = {
        ...p,
        online: p.connectivity === 'online',
        connectedNodeIds: id === 'alice' ? ['bob', 'charlie'] : id === 'bob' ? ['bridge', 'charlie', 'alice'] : id === 'charlie' ? ['bridge', 'bob', 'alice'] : ['bob', 'charlie'],
        packets: [],
      };
    });
    return initial;
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queue, setQueue] = useState<SimulatedPacket[]>([]);
  const [animatedPackets, setAnimatedPackets] = useState<AnimatedPacket[]>([]);
  const [relayingDeviceIds, setRelayingDeviceIds] = useState<Set<string>>(new Set());
  const [recentlySettledIds] = useState<Set<string>>(new Set());
  const [cumulative] = useState({ volumeRouted: 0, hopSum: 0, hopCount: 0 });
  const [batchVolume, setBatchVolume] = useState(0);

  const prevPacketNodesRef = useRef<Record<string, string>>({});
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

  const pushLog = useCallback((tag: LogTag, message: string) => {
    setLogs((current) => {
      const entry: LogEntry = { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, tag, message, timestamp: Date.now() };
      return [entry, ...current].slice(0, 40);
    });
  }, []);

  /** Animates one hop of a packet's journey from `from` to `to`, driving MeshGraph via state. */
  const animateHop = useCallback(
    (packetId: string, from: string, to: string, color: string, durationMs: number, hopCount?: number, ttl?: number, onDone?: () => void) => {
      const start = performance.now();
      const step = (time: number) => {
        if (!isMountedRef.current) return;
        const t = Math.min(1, (time - start) / durationMs);
        setAnimatedPackets((current) => {
          const others = current.filter((p) => p.id !== packetId);
          return t < 1 ? [...others, { id: packetId, from, to, progress: t, color, hopCount, ttl }] : others;
        });
        if (t < 1) {
          const rafId = window.requestAnimationFrame(step);
          rafIdsRef.current.push(rafId);
        } else {
          onDone?.();
        }
      };
      const rafId = window.requestAnimationFrame(step);
      rafIdsRef.current.push(rafId);
    },
    [],
  );

  // Sync real backend devices into devices state when meshQuery returns
  useEffect(() => {
    if (!meshQuery.data) return;

    const nextDevices: Record<string, MeshGraphDevice> = {};
    const backendData: VirtualDeviceDto[] = meshQuery.data;

    backendData.forEach((device) => {
      const id = device.deviceId.toLowerCase();
      const baseProfile = DEVICE_ROSTER[id as DeviceId] || {
        id,
        name: device.name || id,
        vpa: device.vpa || `${id}@doot`,
        accent: device.isBridge ? 'green' : 'cyan',
        isBridge: device.isBridge || id === 'bridge',
        balance: 1000,
        connectivity: 'online',
      };

      nextDevices[id] = {
        id,
        name: device.name || baseProfile.name,
        vpa: device.vpa || baseProfile.vpa,
        accent: baseProfile.accent || (device.isBridge ? 'green' : 'cyan'),
        isBridge: Boolean(device.isBridge || baseProfile.isBridge),
        online: device.online !== false,
        connectivity: baseProfile.connectivity || 'online',
        connectedNodeIds: device.connectedNodeIds || [],
        packets: device.packets || [],
      };
    });

    setDevices(nextDevices);

    // Collect all active packets from backend
    const activePackets: MeshPacketDto[] = [];
    backendData.forEach((d) => {
      if (d.packets) {
        d.packets.forEach((p) => {
          if (!activePackets.some((existing) => existing.packetId === p.packetId)) {
            activePackets.push(p);
          }
        });
      }
    });

    // Check node position changes and trigger animated hops
    activePackets.forEach((packet) => {
      const pId = packet.packetId;
      const currNode = (packet.currentNode || 'alice').toLowerCase();
      const prevNode = prevPacketNodesRef.current[pId];

      if (prevNode && prevNode !== currNode) {
        const color = `hsl(${{ alice: 221, bob: 187, charlie: 271, bridge: 140 }[prevNode] ?? 187}, 85%, 60%)`;
        setRelayingDeviceIds((curr) => new Set(curr).add(prevNode));
        pushLog('relay', `Packet ${pId} gossiped: ${prevNode.toUpperCase()} → ${currNode.toUpperCase()} (TTL: ${packet.ttl}, Hops: ${packet.hopCount ?? 0})`);
        
        animateHop(pId, prevNode, currNode, color, LEG_DURATION_MS, packet.hopCount, packet.ttl, () => {
          setRelayingDeviceIds((curr) => {
            const next = new Set(curr);
            next.delete(prevNode);
            return next;
          });
        });
      }
      prevPacketNodesRef.current[pId] = currNode;
    });

    // Cleanup settled packets
    Object.keys(prevPacketNodesRef.current).forEach((pId) => {
      if (!activePackets.some((p) => p.packetId === pId)) {
        delete prevPacketNodesRef.current[pId];
      }
    });

    // Update queue items from active packets
    const queueItems: SimulatedPacket[] = activePackets.map((p) => ({
      id: p.packetId,
      hash: p.packetId,
      from: (p.visitedNodes?.[0] || 'alice') as DeviceId,
      to: 'bridge' as DeviceId,
      currentHolder: (p.currentNode || 'alice') as DeviceId,
      amount: 100,
      ttl: p.ttl,
      maxTtl: 5,
      hopCount: p.hopCount || 0,
      status: p.currentNode === 'bridge' ? 'settling' : 'relaying',
      createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    }));
    setQueue(queueItems);

  }, [meshQuery.data, animateHop, pushLog]);

  // Quick action to trigger a real payment via backend POST /api/demo/send
  const sendRealPayment = useCallback(
    async (senderVpa = 'alice@doot', receiverVpa = 'charlie@doot', amount = 250, pin = '1234') => {
      try {
        pushLog('crypto', `Initiating payment ${senderVpa} → ${receiverVpa} (${formatCurrency(amount)})`);
        const result = await apiFetch<MeshPacketDto>('/demo/send', {
          method: 'POST',
          body: JSON.stringify({ sender: senderVpa, receiver: receiverVpa, amount, pin }),
        });
        if (result?.packetId) {
          pushLog('ok', `Packet ${result.packetId} injected into mesh at ${result.currentNode || senderVpa}`);
          meshQuery.refetch();
        }
      } catch (err: any) {
        pushLog('info', `Failed to send payment: ${err?.message || 'Unknown error'}`);
      }
    },
    [meshQuery, pushLog],
  );

  const handleSettlementComplete = useCallback(() => {
    onSettlementBatch?.(batchVolume);
    setBatchVolume(0);
  }, [batchVolume, onSettlementBatch]);

  const secondsUntilNextBatch = useCountdown(SETTLEMENT_INTERVAL_SECONDS, 100, handleSettlementComplete);

  const activeBackendPackets = useMemo(() => {
    if (!meshQuery.data) return [];
    const list: MeshPacketDto[] = [];
    meshQuery.data.forEach((d) => {
      if (d.packets) {
        d.packets.forEach((p) => {
          if (!list.some((item) => item.packetId === p.packetId)) {
            list.push(p);
          }
        });
      }
    });
    return list;
  }, [meshQuery.data]);

  const metrics: NetworkMetrics = useMemo(
    () => ({
      packetsInTransit: activeBackendPackets.length,
      totalVolumeRouted: cumulative.volumeRouted,
      averageHopCount: cumulative.hopCount === 0 ? 0 : cumulative.hopSum / cumulative.hopCount,
      activeDeviceCount: Object.values(devices).filter((d) => !d.isBridge).length,
    }),
    [activeBackendPackets.length, cumulative, devices],
  );

  return {
    devices,
    logs,
    queue,
    animatedPackets,
    activeBackendPackets,
    relayingDeviceIds,
    recentlySettledIds,
    metrics,
    sendRealPayment,
    refetchMeshState: meshQuery.refetch,
    settlement: {
      secondsUntilNextBatch,
      batchIntervalSeconds: SETTLEMENT_INTERVAL_SECONDS,
      queuedForSettlement: queue.length,
      lastSettlementAt: null as number | null,
    },
  };
}

