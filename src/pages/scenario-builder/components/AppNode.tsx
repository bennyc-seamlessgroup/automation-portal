import type { NodeProps } from "reactflow";

import type { AppKey, RFData } from "../types";
import { ICON_H, ICON_W } from "../constants";
import { getAppSpec } from "../utils";
import { NodeShell } from "./NodeShell";

// 🔄 VERSION BADGE DISPLAY
// =======================
// This component renders nodes on the scenario builder canvas.
// Shows version badges for all versions (V1, V2, V3, etc.) in less obvious colors.
//
// VERSION BADGE LOGIC:
// - Shows for all versions (V1 uses gray, V2+ uses blue)
// - Smaller and less prominent than before
// - Positioned in bottom-right corner with white border
// - Includes tooltip showing full version
//
// TO ADD VERSION SUPPORT FOR NEW APPS:
// 1. Ensure the AppSpec includes version field: version: 2
// 2. The badge logic below will automatically display it
// 3. Customize badge styling if needed for specific apps
//
// TO MODIFY BADGE APPEARANCE:
// - Update the badge styles in the JSX below
// - Badge size, color, position, etc. can be customized
// - Consider accessibility (color contrast, tooltip text)
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
            position: "relative",
          }}
        >
          {spec.icon ?? ""}
          {/* 🔄 VERSION BADGE - Shows for all versions */}
          {spec.version && (
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                background: spec.version === 1 ? "#6b7280" : "#3b82f6",
                color: "white",
                fontSize: 8,
                fontWeight: "bold",
                borderRadius: "50%",
                width: 14,
                height: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid white",
              }}
              title={`Version ${spec.version}`}
            >
              V{spec.version}
            </div>
          )}
        </div>
      </div>
    </NodeShell>
  );
}
