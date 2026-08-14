import type { Node, Edge } from '@xyflow/react';
import type { DeviceConnectivity } from '@/types/network';

export interface ExtendedDeviceProfile {
  id: string;
  name: string;
  vpa: string;
  accent: string;
  isBridge: boolean;
  online: boolean;
}

export interface DeviceNodeData extends Record<string, unknown> {
  kind: 'device';
  profile: ExtendedDeviceProfile;
  connectivity: DeviceConnectivity;
  isRelaying: boolean;
  isCurrentPacketNode: boolean;
  isVisitedNode: boolean;
  hasPacket: boolean;
  packetCount: number;
}

export interface PacketNodeData extends Record<string, unknown> {
  kind: 'packet';
  color: string;
  packetId?: string;
  hopCount?: number;
  ttl?: number;
}

export type MeshNodeData = DeviceNodeData | PacketNodeData;
export type MeshNode = Node<MeshNodeData>;

export interface MeshEdgeData extends Record<string, unknown> {
  isActive: boolean;
}
export type MeshEdge = Edge<MeshEdgeData>;

export interface AnimatedPacket {
  id: string;
  from: string;
  /** current hop leg endpoint the packet is traveling toward */
  to: string;
  /** 0 -> 1 progress along the current hop leg */
  progress: number;
  color: string;
  hopCount?: number;
  ttl?: number;
  visitedNodes?: string[];
}


