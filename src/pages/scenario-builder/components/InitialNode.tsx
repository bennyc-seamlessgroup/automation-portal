import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

import type { RFData } from "../types";
import { builderStyles } from "../styles";

export function InitialNode({ selected }: NodeProps<RFData>) {
  return (
    <div
      title="Click to choose your first module"
      style={{
        ...builderStyles.roundNode,
        ...builderStyles.dashed,
        cursor: "pointer",
        boxShadow: selected
          ? "0 0 0 3px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.08)"
          : builderStyles.roundNode.boxShadow,
        border: selected ? "2px solid #6366f1" : builderStyles.roundNode.border,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{ width: 8, height: 8, background: "#6366f1", border: "1px solid #fff" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{ width: 8, height: 8, background: "#34d399", border: "1px solid #fff" }}
      />
      <div style={{ ...builderStyles.chip, background: "#6366f1" }}>Start here</div>
      <div style={{ fontSize: 26 }}>+</div>
    </div>
  );
}
