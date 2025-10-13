import type { Node, Edge } from "reactflow";
import type { RFData, AppKey } from "@/pages/scenario-builder/types";
import { uid, getAppSpec } from "@/pages/scenario-builder/utils";
import { addEdge, MarkerType } from "reactflow";

export type ScenarioFunctionsProps = {
  // State setters
  setNodes: React.Dispatch<React.SetStateAction<Node<RFData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<RFData>[]>>;
  setPickerFor: React.Dispatch<React.SetStateAction<{
    sourceId: string | null;
    replaceId?: string | null;
  } | null>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setScenarioName: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  setScheduleEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setIntervalStr: React.Dispatch<React.SetStateAction<"15m" | "1h" | "1d">>;

  // State getters
  nodes: Node<RFData>[];
  edges: Edge<RFData>[];
  scenarioId: string | null;
  scenarioName: string;
  notes: string;
  scheduleEnabled: boolean;
  interval: "15m" | "1h" | "1d";

  // External dependencies
  addLogEntry: (type: string, message: string, details?: Record<string, unknown>) => void;
  emitDebugPayload: (action: string, payload: Record<string, unknown>) => void;
  pushUndo: (nodes: Node<RFData>[], edges: Edge<RFData>[]) => void;
  handleSave: (override?: { nodes: Node<RFData>[]; edges: Edge<RFData>[] }) => void;
};

// Export blueprint function
export const exportBlueprint = (props: ScenarioFunctionsProps) => {
  const data = {
    name: props.scenarioName,
    notes: props.notes,
    nodes: props.nodes,
    edges: props.edges,
    scheduleEnabled: props.scheduleEnabled,
    interval: props.interval,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${props.scenarioName.replace(/\s+/g, "_")}.blueprint.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import blueprint function
export const importBlueprint = (
  file: File,
  props: ScenarioFunctionsProps
) => {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result));
      if (obj.nodes && obj.edges) {
        props.pushUndo(props.nodes, props.edges);
        props.setNodes(obj.nodes);
        props.setEdges(obj.edges);
        if (obj.name) props.setScenarioName(obj.name);
        if (obj.notes) props.setNotes(obj.notes);
        if (typeof obj.scheduleEnabled === "boolean")
          props.setScheduleEnabled(obj.scheduleEnabled);
        if (obj.interval) props.setIntervalStr(obj.interval);
        props.handleSave();
      } else {
        alert("Invalid blueprint file.");
      }
    } catch {
      alert("Failed to parse blueprint.");
    }
  };
  reader.readAsText(file);
};

// Auto-align function
export const autoAlign = (props: ScenarioFunctionsProps) => {
  // naive left-to-right layout by BFS from initial
  const start = props.nodes.find((n) => n.type === "initial") ?? props.nodes[0];
  if (!start) return;
  const adj = new Map<string, string[]>();
  props.edges.forEach((e) => {
    adj.set(e.source, [...(adj.get(e.source) || []), e.target]);
  });
  const level = new Map<string, number>();
  const order: string[] = [];
  const q = [start.id];
  level.set(start.id, 0);
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    for (const v of adj.get(u) || []) {
      if (!level.has(v)) {
        level.set(v, (level.get(u) ?? 0) + 1);
        q.push(v);
      }
    }
  }
  const spacingX = 220,
    spacingY = 140;
  const grouped = new Map<number, string[]>();
  level.forEach((lv, id) =>
    grouped.set(lv, [...(grouped.get(lv) || []), id])
  );
  const centerY = 200;
  const newNodes = props.nodes.map((n) => {
    const lv = level.get(n.id) ?? 0;
    const siblings = grouped.get(lv) || [];
    const idx = siblings.indexOf(n.id);
    const y = centerY + (idx - (siblings.length - 1) / 2) * spacingY;
    const x = 100 + lv * spacingX;
    return { ...n, position: { x, y } };
  });
  props.pushUndo(props.nodes, props.edges);
  props.setNodes(newNodes as Node<RFData>[]);
  props.addLogEntry("info", "Auto-aligned nodes", { nodeCount: newNodes.length });
};

// Explain flow text function
export const explainFlowText = (props: ScenarioFunctionsProps) => {
  const nameOf = (id: string) =>
    (props.nodes.find((n) => n.id === id)?.data as RFData)?.label ||
    props.nodes.find((n) => n.id === id)?.type ||
    id;
  const outsOf = (id: string) =>
    props.edges.filter((e) => e.source === id).map((e) => e.target);
  const start = props.nodes.find((n) => n.type === "initial")?.id || props.nodes[0]?.id;
  const visited = new Set<string>();
  const lines: string[] = [];
  function dfs(u: string, depth = 0) {
    if (!u || visited.has(u)) return;
    visited.add(u);
    const outs = outsOf(u);
    const label = nameOf(u);
    if (depth === 0) lines.push(`Flow starts at **${label}**.`);
    outs.forEach((v) => {
      const step = nameOf(v);
      lines.push(`-> Then ${step}.`);
      dfs(v, depth + 1);
    });
    if (outs.length === 0 && depth > 0)
      lines.push(`-> Ends after **${label}**.`);
  }
  dfs(start, 0);
  if (lines.length === 0) return "Empty flow. Add modules to begin.";
  return lines.join("\n");
};

// Run once function
export const handleRunOnce = (props: ScenarioFunctionsProps) => {
  props.addLogEntry("info", "Scenario execution started", {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
  });
  alert("Run once: executing the scenario now.\n(Stub)");
  props.addLogEntry("success", "Scenario execution completed", {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
  });
};

// Publish function
export const handlePublish = (props: ScenarioFunctionsProps) => {
  props.addLogEntry("success", "Scenario published", {
    scenarioName: props.scenarioName,
    nodeCount: props.nodes.length,
  });
  alert("Published (stub): expose this scenario for production runs.");
};

// Test run function
export const handleTestRun = (props: ScenarioFunctionsProps) => {
  props.emitDebugPayload("scenarioBuilder.test.start", {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
    scenarioId: props.scenarioId,
  });
  props.addLogEntry("info", "Test run started", {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
  });
  alert(
    "Test run: this would execute in dry-run mode.\n(Stub) Nodes: " +
      props.nodes.length +
      ", Edges: " +
      props.edges.length
  );
  props.addLogEntry("success", "Test run completed", {
    nodeCount: props.nodes.length,
    edgeCount: props.edges.length,
  });
};

// Function picker handler
export const handleFunctionPick = (
  key: string,
  pickerFor: {
    sourceId: string | null;
    replaceId?: string | null;
  } | null,
  props: ScenarioFunctionsProps
) => {
  const spec = getAppSpec(key as AppKey);
  const replaceId = pickerFor?.replaceId ?? null;
  const srcId = pickerFor?.sourceId ?? null;

  if (replaceId) {
    props.setNodes(
      (nds) =>
        nds.map((n) =>
          n.id === replaceId
            ? {
                ...n,
                type: "app",
                data: { label: spec.name, appKey: key, values: {} },
              }
            : n
        ) as Node<RFData>[]
    );
    props.addLogEntry("info", `Replaced node with: ${spec.name}`, {
      nodeId: replaceId,
      appKey: key,
    });
    props.setPickerFor(null);
    props.setSelectedId(replaceId);
    props.setDrawerOpen(true);
    return;
  }

  const id = uid("app");
  const pos = srcId
    ? props.nodes.find((n) => n.id === srcId)?.position ?? { x: 200, y: 200 }
    : { x: 240, y: 180 };
  const newNode: Node<RFData> = {
    id,
    type: "app",
    position: { x: pos.x + 220, y: pos.y },
    data: { label: spec.name, appKey: key as AppKey, values: {} },
  };
  props.pushUndo(props.nodes, props.edges);
  props.setNodes((nds) => nds.concat(newNode) as Node<RFData>[]);
  if (srcId)
    props.setEdges((eds) =>
      addEdge(
        {
          id: uid("e"),
          source: srcId,
          target: id,
          markerEnd: { type: MarkerType.ArrowClosed },
          animated: true,
        },
        eds
      )
    );

  // Log the node creation
  props.addLogEntry("success", `Added node: ${spec.name}`, {
    nodeId: id,
    appKey: key,
    connectedFrom: srcId || null,
  });

  props.setPickerFor(null);
  props.setSelectedId(id);
  props.setDrawerOpen(true);
  // Auto-save when new node is added
  setTimeout(() => props.handleSave(), 100);

  // Debug payload for node creation - Enhanced with full state snapshot and diff info for backend team
  props.emitDebugPayload("scenarioBuilder.node.create", {
    nodeId: id,
    nodeName: spec.name,
    appKey: key,
    connectedFrom: srcId,
    scenarioId: props.scenarioId,
    // Full state snapshot for backend persistence
    fullState: {
      scenarioId: props.scenarioId,
      scenarioName: props.scenarioName,
      notes: props.notes,
      nodes: props.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        selected: n.selected,
        dragging: n.dragging,
      })),
      edges: props.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        markerEnd: e.markerEnd,
        animated: e.animated,
        style: e.style,
      })),
      scheduleEnabled: props.scheduleEnabled,
      interval: props.interval,
    },
    // Minimal diff info for backend team
    diff: {
      action: "node_created",
      timestamp: new Date().toISOString(),
      nodeId: id,
      nodeType: "app",
      nodeData: { label: spec.name, appKey: key as AppKey, values: {} },
      connectedFrom: srcId,
      changes: `Added new node: ${spec.name}`,
    },
  });
};
