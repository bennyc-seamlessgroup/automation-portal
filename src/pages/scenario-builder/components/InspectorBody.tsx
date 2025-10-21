// src/pages/scenario-builder/components/InspectorBody.tsx
import type { Node } from "reactflow";

import type { RFData } from "../types";
import { UniversalInspector } from "./UniversalInspector";

type InspectorBodyProps = {
  node: Node<RFData>;
  nodes: Node<RFData>[];
  onChangeNode: (node: Node<RFData>) => void;
  onDeleteNode: (id: string) => void;
  onClose?: () => void;
  onShowAlert?: (message: string) => void;
};

export function InspectorBody({ node, nodes, onChangeNode, onDeleteNode, onClose, onShowAlert }: InspectorBodyProps) {
  const isApp = node.type === "app";
  const data = (node.data || {}) as RFData;

  // Use universal inspector for all app nodes
  if (isApp && data.appKey) {
    return (
      <UniversalInspector
        node={node}
        nodes={nodes}
        onChangeNode={onChangeNode}
        onDeleteNode={onDeleteNode}
        onClose={onClose}
        onShowAlert={onShowAlert}
      />
    );
  }

  // Default fallback for non-app nodes or nodes without appKey
  return (
    <div style={{
      padding: "24px",
      textAlign: "center",
      color: "#6b7280",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      margin: "16px"
    }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
      <p>Select an app node to configure its settings.</p>
    </div>
  );
}

export default InspectorBody;
