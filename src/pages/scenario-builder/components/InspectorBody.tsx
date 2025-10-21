// src/pages/scenario-builder/components/InspectorBody.tsx
import type { Node } from "reactflow";

import type { RFData } from "../types";
import { GmailInspector } from "./GmailInspector";
import { TelegramInspector } from "./TelegramInspector";
import { GenericAppInspector } from "./GenericAppInspector";

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

  // Route to appropriate inspector based on app type
  if (isApp && String(data.appKey).toLowerCase().includes("gmail")) {
    return (
      <GmailInspector
        node={node}
        nodes={nodes}
        onChangeNode={onChangeNode}
        onDeleteNode={onDeleteNode}
        onClose={onClose}
        onShowAlert={onShowAlert}
      />
    );
  }

  if (isApp && String(data.appKey).toLowerCase().includes("telegram")) {
    return (
      <TelegramInspector
        node={node}
        nodes={nodes}
        onChangeNode={onChangeNode}
        onDeleteNode={onDeleteNode}
        onClose={onClose}
        onShowAlert={onShowAlert}
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
