import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import { getDeviceLayout, interpolatePoint, type Point } from "./layout";
import { DeviceNode } from "./DeviceNode";
import { PacketNode } from "./PacketNode";
import type { AnimatedPacket, ExtendedDeviceProfile, MeshEdge, MeshNode } from "./types";
import { MESH_EDGES } from "@/lib/constants";
import type { DeviceConnectivity, DeviceId } from "@/types/network";
import type { MeshPacketDto } from "@/types/api";

const NODE_TYPES: NodeTypes = {
  device: DeviceNode,
  packet: PacketNode,
};

export interface MeshGraphDevice extends ExtendedDeviceProfile {
  connectedNodeIds?: string[];
  packets?: MeshPacketDto[];
  connectivity?: DeviceConnectivity;
}

interface MeshGraphProps {
  devices: Record<string, MeshGraphDevice>;
  relayingDeviceIds?: Set<string>;
  animatedPackets?: AnimatedPacket[];
  activePackets?: MeshPacketDto[];
}

function getPointForDevice(layout: Record<DeviceId, Point>, deviceId: string): Point {
  if (!deviceId) return { x: 50, y: 40 };
  const key = deviceId.split('@')[0]?.toLowerCase() as DeviceId;
  if (key in layout) {
    return layout[key];
  }
  return { x: 220, y: 120 };
}

export function MeshGraph({
  devices,
  relayingDeviceIds = new Set(),
  animatedPackets = [],
  activePackets = [],
}: MeshGraphProps) {
  const layout = getDeviceLayout();

  // Combine active packets from prop and device packets
  const allActivePackets = useMemo(() => {
    const list: MeshPacketDto[] = [...activePackets];
    Object.values(devices).forEach((d) => {
      if (d.packets) {
        d.packets.forEach((p) => {
          if (!list.some((existing) => existing.packetId === p.packetId)) {
            list.push(p);
          }
        });
      }
    });
    return list;
  }, [activePackets, devices]);

  // Determine current packet nodes and visited nodes across all active packets
  const currentPacketNodeIds = useMemo(() => {
    const set = new Set<string>();
    allActivePackets.forEach((p) => {
      if (p.currentNode) set.add(p.currentNode.toLowerCase());
    });
    return set;
  }, [allActivePackets]);

  const visitedNodeIds = useMemo(() => {
    const set = new Set<string>();
    allActivePackets.forEach((p) => {
      if (p.visitedNodes) {
        p.visitedNodes.forEach((nodeId) => set.add(nodeId.toLowerCase()));
      }
    });
    return set;
  }, [allActivePackets]);

  // Construct device nodes
  const deviceNodes: MeshNode[] = useMemo(
    () =>
      Object.values(devices).map((device) => {
        const idLower = device.id.toLowerCase();
        const pos = getPointForDevice(layout, idLower);
        const hasPacket = (device.packets && device.packets.length > 0) || currentPacketNodeIds.has(idLower);
        const isCurrentPacketNode = currentPacketNodeIds.has(idLower);
        const isVisitedNode = visitedNodeIds.has(idLower);

        return {
          id: device.id,
          type: "device",
          position: pos,
          data: {
            kind: "device",
            profile: {
              id: device.id,
              name: device.name || device.id,
              vpa: device.vpa || `${device.id}@doot`,
              accent: device.accent || (device.isBridge ? 'green' : 'cyan'),
              isBridge: Boolean(device.isBridge),
              online: device.online !== false,
            },
            connectivity: device.connectivity || 'online',
            isRelaying: relayingDeviceIds.has(device.id),
            isCurrentPacketNode,
            isVisitedNode,
            hasPacket,
            packetCount: device.packets?.length || 0,
          },
          draggable: false,
          selectable: false,
          connectable: false,
        };
      }),
    [devices, layout, relayingDeviceIds, currentPacketNodeIds, visitedNodeIds],
  );

  // Derive dynamic edges from device connectedNodeIds or fall back to standard MESH_EDGES
  const dynamicEdgePairs = useMemo(() => {
    const pairsSet = new Set<string>();
    const result: Array<[string, string]> = [];

    Object.values(devices).forEach((device) => {
      const fromId = device.id.toLowerCase();
      if (device.connectedNodeIds && device.connectedNodeIds.length > 0) {
        device.connectedNodeIds.forEach((toIdRaw) => {
          const toId = toIdRaw.toLowerCase();
          const key = [fromId, toId].sort().join("---");
          if (!pairsSet.has(key) && fromId !== toId) {
            pairsSet.add(key);
            result.push([fromId, toId]);
          }
        });
      }
    });

    if (result.length === 0) {
      return MESH_EDGES;
    }
    return result;
  }, [devices]);

  // Construct packet nodes for animation in flight
  const packetNodes: MeshNode[] = useMemo(
    () =>
      animatedPackets.map((packet) => {
        const fromPos = getPointForDevice(layout, packet.from);
        const toPos = getPointForDevice(layout, packet.to);
        const from = centerOf(fromPos);
        const to = centerOf(toPos);
        const point = interpolatePoint(from, to, packet.progress);
        return {
          id: `packet-${packet.id}`,
          type: "packet",
          position: point,
          data: {
            kind: "packet",
            color: packet.color || 'hsl(var(--mesh-cyan))',
            packetId: packet.id,
            hopCount: packet.hopCount,
            ttl: packet.ttl,
          },
          draggable: false,
          selectable: false,
          connectable: false,
          zIndex: 20,
        } as MeshNode;
      }),
    [animatedPackets, layout],
  );

  // Construct canvas edges
  const edges: MeshEdge[] = useMemo(
    () =>
      dynamicEdgePairs.map(([a, b]) => {
        const isAnimatedHop = animatedPackets.some(
          (p) => (p.from.toLowerCase() === a && p.to.toLowerCase() === b) || (p.from.toLowerCase() === b && p.to.toLowerCase() === a),
        );
        const isVisitedHop = allActivePackets.some((p) => {
          if (!p.visitedNodes || p.visitedNodes.length < 2) return false;
          const v = p.visitedNodes.map((n) => n.toLowerCase());
          const idxA = v.indexOf(a);
          const idxB = v.indexOf(b);
          return idxA !== -1 && idxB !== -1 && Math.abs(idxA - idxB) === 1;
        });

        const isActive = isAnimatedHop || isVisitedHop;

        return {
          id: `${a}-${b}`,
          source: a,
          target: b,
          data: { isActive },
          animated: true,
          style: {
            stroke: isActive
              ? "#06b6d4"
              : "rgba(56, 189, 248, 0.5)",
            strokeWidth: isActive ? 2.5 : 1.75,
            opacity: 0.9,
          },
        } as MeshEdge;
      }),
    [dynamicEdgePairs, animatedPackets, allActivePackets],
  );

  return (
    <div className="relative flex flex-col gap-2">
      {/* Active Packet Route Header Banner if packets are in flight */}
      {allActivePackets.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mesh-cyan/30 bg-mesh-cyan/5 px-3 py-1.5 text-xs font-mono text-foreground">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mesh-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mesh-cyan" />
            </span>
            <span className="font-semibold text-mesh-cyan">
              {allActivePackets[0]?.packetId}
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">
              Holder: <strong className="text-foreground uppercase">{allActivePackets[0]?.currentNode}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {allActivePackets[0]?.visitedNodes && (
              <span className="text-[11px]">
                Route: <span className="text-mesh-purple font-semibold">{allActivePackets[0].visitedNodes.join(" → ")}</span>
              </span>
            )}
            {allActivePackets[0]?.hopCount !== undefined && (
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] border border-border-soft">
                Hops: <strong>{allActivePackets[0].hopCount}</strong>
              </span>
            )}
            {allActivePackets[0]?.ttl !== undefined && (
              <span className="rounded bg-amber-500/10 text-amber-400 px-1.5 py-0.5 text-[10px] border border-amber-500/20 font-semibold">
                TTL: {allActivePackets[0].ttl}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main ReactFlow Graph Canvas */}
      <div className="h-[340px] overflow-hidden rounded-xl border border-border-soft bg-black/25 backdrop-blur-sm relative">
        <ReactFlow
          nodes={[...deviceNodes, ...packetNodes]}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.35 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.25}
            color="hsl(var(--border-soft))"
          />
        </ReactFlow>
      </div>
    </div>
  );
}

function centerOf(point: Point): Point {
  // Nodes render ~45px wide; nudge the interpolated packet path to the visual center.
  return { x: point.x + 20, y: point.y + 20 };
}


