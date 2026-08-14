import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import { getDeviceLayout, interpolatePoint } from "./layout";
import { DeviceNode } from "./DeviceNode";
import { PacketNode } from "./PacketNode";
import type { AnimatedPacket, MeshEdge, MeshNode } from "./types";
import { MESH_EDGES } from "@/lib/constants";
import type { DeviceProfile } from "@/types/network";

// Defined once at module scope — React Flow warns (and re-renders needlessly)
// if nodeTypes/edgeTypes are recreated on every render.
const NODE_TYPES: NodeTypes = {
  device: DeviceNode,
  packet: PacketNode,
};

interface MeshGraphProps {
  devices: Record<string, DeviceProfile>;
  relayingDeviceIds: Set<string>;
  animatedPackets: AnimatedPacket[];
}

export function MeshGraph({
  devices,
  relayingDeviceIds,
  animatedPackets,
}: MeshGraphProps) {
  const layout = getDeviceLayout();

  const deviceNodes: MeshNode[] = useMemo(
    () =>
      Object.values(devices).map((profile) => ({
        id: profile.id,
        type: "device",
        position: layout[profile.id],
        data: {
          kind: "device",
          profile,
          connectivity: profile.connectivity,
          isRelaying: relayingDeviceIds.has(profile.id),
        },
        draggable: false,
        selectable: false,
        connectable: false,
      })),
    // layout is static; devices/relaying state drive re-computation
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [devices, relayingDeviceIds],
  );

  const packetNodes: MeshNode[] = useMemo(
    () =>
      animatedPackets.map((packet) => {
        const from = centerOf(layout[packet.from]);
        const to = centerOf(layout[packet.to]);
        const point = interpolatePoint(from, to, packet.progress);
        return {
          id: `packet-${packet.id}`,
          type: "packet",
          position: point,
          data: { kind: "packet", color: packet.color },
          draggable: false,
          selectable: false,
          connectable: false,
          zIndex: 10,
        } as MeshNode;
      }),
    [animatedPackets, layout],
  );

  const edges: MeshEdge[] = useMemo(
    () =>
      MESH_EDGES.map(([a, b]) => {
        const isActive = animatedPackets.some(
          (p) => (p.from === a && p.to === b) || (p.from === b && p.to === a),
        );
        return {
          id: `${a}-${b}`,
          source: a,
          target: b,
          data: { isActive },
          animated: isActive,
          style: {
            stroke: isActive
              ? "hsl(var(--mesh-cyan))"
              : "hsl(var(--border) / 1)",
            strokeWidth: isActive ? 1.75 : 1.25,
          },
        } as MeshEdge;
      }),
    [animatedPackets],
  );

  return (
    <div className="h-[340px] overflow-hidden rounded-xl border border-border-soft bg-black/15">
      <ReactFlow
        nodes={[...deviceNodes, ...packetNodes]}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
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
          size={1}
          color="hsl(var(--border-soft))"
        />
      </ReactFlow>
    </div>
  );
}

function centerOf(point: { x: number; y: number }) {
  // Nodes render ~40px wide; nudge the interpolated packet path to the visual center.
  return { x: point.x + 16, y: point.y + 16 };
}
