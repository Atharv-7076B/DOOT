/** A virtual device participating in the mesh. 'bridge' is the special gateway node. */
export type DeviceId = 'alice' | 'bob' | 'charlie' | 'bridge';

export type DeviceConnectivity = 'online' | 'relaying' | 'unreachable';

export interface DeviceProfile {
  id: DeviceId;
  name: string;
  vpa: string;
  /** hue token from the mesh palette, e.g. 'blue' | 'cyan' | 'purple' | 'green' */
  accent: 'blue' | 'cyan' | 'purple' | 'green';
  isBridge: boolean;
  balance: number;
  connectivity: DeviceConnectivity;
}

export type PacketStatus = 'encrypting' | 'relaying' | 'awaiting-bridge' | 'settling' | 'settled' | 'expired';

export interface SimulatedPacket {
  id: string;
  hash: string;
  from: DeviceId;
  to: DeviceId;
  /** current holder of the packet as it hops through the mesh */
  currentHolder: DeviceId;
  amount: number;
  ttl: number;
  maxTtl: number;
  hopCount: number;
  status: PacketStatus;
  createdAt: number;
}

export type LogTag = 'info' | 'relay' | 'crypto' | 'ok' | 'warn';

export interface LogEntry {
  id: string;
  tag: LogTag;
  message: string;
  timestamp: number;
}

export interface NetworkMetrics {
  packetsInTransit: number;
  totalVolumeRouted: number;
  averageHopCount: number;
  activeDeviceCount: number;
}

export interface SettlementState {
  secondsUntilNextBatch: number;
  batchIntervalSeconds: number;
  queuedForSettlement: number;
  lastSettlementAt: number | null;
}
