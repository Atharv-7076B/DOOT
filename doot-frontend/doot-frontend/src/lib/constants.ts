import type { DeviceId, DeviceProfile } from '@/types/network';

export const DEVICE_ROSTER: Record<DeviceId, DeviceProfile> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    vpa: 'alice@doot',
    accent: 'blue',
    isBridge: false,
    balance: 4200,
    connectivity: 'online',
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    vpa: 'bob@doot',
    accent: 'cyan',
    isBridge: false,
    balance: 3150,
    connectivity: 'online',
  },
  charlie: {
    id: 'charlie',
    name: 'Charlie',
    vpa: 'charlie@doot',
    accent: 'purple',
    isBridge: false,
    balance: 1875,
    connectivity: 'online',
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    vpa: 'bridge@doot',
    accent: 'green',
    isBridge: true,
    balance: 0,
    connectivity: 'online',
  },
};

/** Static mesh topology: which devices currently have a direct link. */
export const MESH_EDGES: Array<[DeviceId, DeviceId]> = [
  ['alice', 'bob'],
  ['alice', 'charlie'],
  ['bob', 'charlie'],
  ['bob', 'bridge'],
  ['charlie', 'bridge'],
];

export const MAX_PACKET_TTL = 5;
export const SETTLEMENT_INTERVAL_SECONDS = 8;
export const PACKET_SPAWN_INTERVAL_MS = 2600;
