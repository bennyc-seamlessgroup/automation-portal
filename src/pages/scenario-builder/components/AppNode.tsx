import type { NodeProps } from "reactflow";

import type { AppKey, RFData } from "../types";
import { ICON_H, ICON_W } from "../constants";
import { getAppSpec } from "../utils";
import { NodeShell } from "./NodeShell";

export function AppNode({ id, data, selected }: NodeProps<RFData>) {
  const spec = getAppSpec(data.appKey as AppKey);
  const displayLabel = data.label || spec.name;
  return (
    <NodeShell id={id} color={spec.color} label={displayLabel} selected={selected}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 8 }}>
        <div
          title={spec.name}
          style={{
            width: ICON_W,
            height: ICON_H,
            borderRadius: "50%",
            background: spec.color,
            color: "white",
            fontSize: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        >
          {spec.icon ?? ""}
        </div>
      </div>
    </NodeShell>
  );
}
