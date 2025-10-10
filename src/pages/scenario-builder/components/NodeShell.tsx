import type { ReactNode } from "react";
import { Handle, Position } from "reactflow";

import { ADD_NEXT_EVENT } from "../constants";
import { builderStyles } from "../styles";

export type NodeShellProps = {
  id: string;
  color?: string;
  label: string;
  children?: ReactNode;
  showPlus?: boolean;
  selected?: boolean;
};

export function NodeShell({ id, color, label, children, showPlus = true, selected = false }: NodeShellProps) {
  return (
    <div
      style={{
        ...builderStyles.roundNode,
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
      <div style={{ ...builderStyles.chip, background: color ?? "#111827" }}>{label}</div>
      {children}
      {showPlus && (
        <button
          aria-label="Add next module"
          style={builderStyles.plusOnNode as any}
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent(ADD_NEXT_EVENT, { detail: { id } }));
          }}
        >
          +
        </button>
      )}
    </div>
  );
}
