import type { NodeProps } from '@xyflow/react';
import type { PacketNodeData } from './types';

/**
 * A packet in flight. Its position is set by the parent's simulation loop via
 * setNodes — this component never moves itself, it only renders the glow.
 */
export function PacketNode({ data }: NodeProps & { data: PacketNodeData }) {
  return (
    <div
      className="h-2.5 w-2.5 rounded-full"
      style={{ background: data.color, boxShadow: `0 0 10px ${data.color}, 0 0 18px ${data.color}` }}
    />
  );
}
