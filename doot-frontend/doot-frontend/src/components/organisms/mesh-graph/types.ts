import type { Node, Edge } from '@xyflow/react';
import type { DeviceConnectivity, DeviceId, DeviceProfile } from '@/types/network';

export interface DeviceNodeData extends Record<string, unknown> {
  kind: 'device';
  profile: DeviceProfile;
  connectivity: DeviceConnectivity;
  isRelaying: boolean;
}

export interface PacketNodeData extends Record<string, unknown> {
  kind: 'packet';
  color: string;
}

export type MeshNodeData = DeviceNodeData | PacketNodeData;
export type MeshNode = Node<MeshNodeData>;

export interface MeshEdgeData extends Record<string, unknown> {
  isActive: boolean;
}
export type MeshEdge = Edge<MeshEdgeData>;

export interface AnimatedPacket {
  id: string;
  from: DeviceId;
  /** current hop leg endpoint the packet is traveling toward */
  to: DeviceId;
  /** 0 -> 1 progress along the current hop leg */
  progress: number;
  color: string;
}
