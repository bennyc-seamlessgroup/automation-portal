// src/pages/scenario-builder/components/InspectorBody.tsx
import type { Node } from "reactflow";

import type { RFData } from "../types";
import { GmailInspector } from "./GmailInspector";
import { GenericAppInspector } from "./GenericAppInspector";

type InspectorBodyProps = {
  node: Node<RFData>;
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
  onManualSave?: () => void;
  onClose?: () => void;
};

export function InspectorBody({ node, onChangeNode, onDeleteNode, onManualSave, onClose }: InspectorBodyProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;

  // Route to appropriate inspector based on app type
  if (isApp && String(data.appKey).toLowerCase().includes("gmail")) {
    return (
      <GmailInspector
        node={node}
        onChangeNode={onChangeNode}
        onDeleteNode={onDeleteNode}
        onManualSave={onManualSave}
        onClose={onClose}
      />
    );
  }

  // Default to generic inspector for all other apps
  return (
    <GenericAppInspector
      node={node}
      onChangeNode={onChangeNode}
      onDeleteNode={onDeleteNode}
    />
  );
}

export default InspectorBody;
