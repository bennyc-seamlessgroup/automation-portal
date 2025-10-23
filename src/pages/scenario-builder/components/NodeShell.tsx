import type { ReactNode } from "react";
import { Handle, Position } from "reactflow";

import { ADD_NEXT_EVENT } from "../constants";
import { NODE_W, NODE_H } from "../constants";

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
        width: NODE_W,
        height: NODE_H,
        borderRadius: "50%",
        boxShadow: selected
          ? "0 0 0 3px rgba(99,102,241,0.35), 0 4px 16px rgba(0,0,0,0.15)"
          : "0 4px 16px rgba(0,0,0,0.1)",
        border: selected ? "2px solid #6366f1" : "none",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        textAlign: "center",
        padding: 2,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          width: 10,
          height: 10,
          background: "#6366f1",
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          width: 10,
          height: 10,
          background: "#34d399",
          border: "2px solid #fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      />
      <div style={{
        position: "absolute",
        top: -10,
        left: "50%",
        transform: "translateX(-50%)",
        background: color ?? "#111827",
        fontSize: 11,
        color: "#fff",
        borderRadius: 12,
        padding: "2px 8px",
        whiteSpace: "nowrap",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
      }}>
        {label}
      </div>
      {children}
      {showPlus && (
        <button
          aria-label="Add next module"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -32,
            marginLeft: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#f8fafc",
            border: "1px solid #d1d5db",
            color: "#374151",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
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
