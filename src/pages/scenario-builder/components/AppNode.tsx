import type { NodeProps } from "reactflow";

import type { AppKey, RFData } from "../types";
import { ICON_H, ICON_W } from "../constants";
import { getAppSpec } from "../utils";
import { NodeShell } from "./NodeShell";

// 🔄 VERSION BADGE DISPLAY
// =======================
// This component renders nodes on the scenario builder canvas.
// Shows version badges for all versions (V1, V2, V3, etc.) with improved visibility.
//
// NEW DESIGN:
// - White outer circle (96px) with colored inner circle (80px)
// - Version badges positioned at top: 62, right: 27 for full visibility
// - Black badges for V1, blue badges for V2+ displaying "V1", "V2" format
// - Enhanced shadows and compact size for maximum visibility
// - Professional appearance with proper spacing
//
// VERSION BADGE LOGIC:
// - Shows for all versions (V1 uses #000000, V2+ uses #0000ff)
// - Compact badges (24px) positioned at top: 62, right: 27
// - Displays "V1", "V2" format instead of just numbers
// - Enhanced shadows, high z-index for visibility
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
          overflow: "hidden",
        }}
      >
          {/* 🎨 ICON RENDERING SYSTEM - Canvas Node Version
           * =============================================
           * Automatically detects and renders icons appropriately:
           * - Image icons (paths starting with '/'): Rendered as <img> tags
           * - Emoji icons (text): Rendered as text content
           * - Larger size (36px) for better visibility on canvas
           * - Maintains backward compatibility with existing emoji icons
           */}
          {spec.icon?.startsWith('/') ? (
            <img
              src={spec.icon}
              alt={spec.name}
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
              }}
            />
          ) : (
            spec.icon ?? ""
          )}
          {/* 🔄 VERSION BADGE - Shows for all versions */}
          {spec.version && (
            <div
              style={{
                position: "absolute",
                top: 62,
                right: 27,
                
                color: "white",
                fontSize: 6,
                fontWeight: "bold",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                zIndex: 100,
              }}
              title={`Version ${spec.version}`}
            >
              V{spec.version}
            </div>
          )}
        </div>
    </NodeShell>
  );
}
