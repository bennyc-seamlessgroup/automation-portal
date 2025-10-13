import type { Node, Edge } from "reactflow";
import type { Scenario } from "@/types/scenarios";
import type { RFData } from "@/pages/scenario-builder/types";
import { uid } from "@/pages/scenario-builder/utils";
import { VERSIONS_KEY } from "@/pages/scenario-builder/constants";

export type ScenarioServicesProps = {
  // State setters
  setNodes: React.Dispatch<React.SetStateAction<Node<RFData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge<RFData>[]>>;
  setSavedId: React.Dispatch<React.SetStateAction<string | null>>;
  setSavingFlash: React.Dispatch<React.SetStateAction<string | null>>;
  setVersions: React.Dispatch<React.SetStateAction<any[]>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setOriginalNodeData: React.Dispatch<React.SetStateAction<RFData | null>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedId: React.Dispatch<React.SetStateAction<string | null>>;
  setScenarioName: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  setShowVersions: React.Dispatch<React.SetStateAction<boolean>>;
  setIntervalStr: React.Dispatch<React.SetStateAction<"15m" | "1h" | "1d">>;
  setScheduleEnabled: React.Dispatch<React.SetStateAction<boolean>>;

  // State getters
  nodes: Node<RFData>[];
  edges: Edge<RFData>[];
  savedId: string | null;
  scenarioId: string | null;
  scenarioName: string;
  notes: string;
  versions: any[];
  scheduleEnabled: boolean;
  interval: "15m" | "1h" | "1d";
  originalNodeData: RFData | null;
  hasUnsavedChanges: boolean;
  selectedId: string | null;

  // Refs
  rf: React.RefObject<HTMLDivElement>;
  suppressOpenRef: React.RefObject<boolean>;

  // External dependencies
  save: (scenario: Scenario) => void;
  addLogEntry: (type: string, message: string, details?: Record<string, unknown>) => void;
  emitDebugPayload: (action: string, payload: Record<string, unknown>) => void;
  pushUndo: (nodes: Node<RFData>[], edges: Edge<RFData>[]) => void;
};

// Unified save function for autosave
export const unifiedSave = (
  data: {
    nodes: Node<RFData>[];
    edges: Edge<RFData>[];
    name: string;
    notes: string;
  },
  props: ScenarioServicesProps
) => {
  const { nodes, edges, name, notes } = data;

  // Save local draft - REMOVE this old localStorage approach
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Persist to shared scenarios store
  const id =
    props.savedId ??
    (props.scenarioId && props.scenarioId !== "new" ? props.scenarioId : uid("scn"));
  if (!props.savedId && (!props.scenarioId || props.scenarioId === "new")) props.setSavedId(id);
  const modules = Math.max(
    0,
    nodes.filter((n) => n.type !== "initial").length
  );
  const meta =
    modules > 0
      ? `Auto-saved - ${modules} module${modules === 1 ? "" : "s"}`
      : "Auto-saved";
  const record: Scenario = {
    id,
    title: name || "Untitled Scenario",
    meta,
    status: "stopped",
    owner: "BC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    graph: { nodes, edges, name, notes },
  };
  props.save(record);

  // Log the save action
  props.addLogEntry("success", `Auto-saved: ${name}`, {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    scenarioId: id,
  });

  props.setSavingFlash("Auto-saved");
  setTimeout(() => props.setSavingFlash(null), 1200);

  // Debug payload for autosave - Enhanced with full state snapshot and diff info for backend team
  props.emitDebugPayload("scenarioBuilder.save.autosave", {
    scenarioId: id,
    scenarioName: name,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    modules,
    // Full state snapshot for backend persistence
    fullState: {
      scenarioId: id,
      scenarioName: name,
      notes,
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        selected: n.selected,
        dragging: n.dragging,
      })),
      edges: edges.map((e) => ({
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
      action: "autosave",
      timestamp: new Date().toISOString(),
      previousNodeCount: nodes.length,
      previousEdgeCount: edges.length,
      changes: "auto-saved current state",
    },
  });
};

// Manual save function
export const handleSave = (
  props: ScenarioServicesProps,
  override?: { nodes: Node<RFData>[]; edges: Edge<RFData>[] }
) => {
  // Persist to shared scenarios store
  const id =
    props.savedId ??
    (props.scenarioId && props.scenarioId !== "new" ? props.scenarioId : uid("scn"));
  if (!props.savedId && (!props.scenarioId || props.scenarioId === "new")) props.setSavedId(id);
  const currentNodes = override?.nodes ?? props.nodes;
  const currentEdges = override?.edges ?? props.edges;
  const modules = Math.max(
    0,
    currentNodes.filter((n) => n.type !== "initial").length
  );
  const meta =
    modules > 0
      ? `Manual - ${modules} module${modules === 1 ? "" : "s"}`
      : "Manual";
  const record: Scenario = {
    id,
    title: props.scenarioName || "Untitled Scenario",
    meta,
    status: "stopped",
    owner: "BC",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    graph: {
      nodes: currentNodes,
      edges: currentEdges,
      name: props.scenarioName,
      notes: props.notes,
    },
  };
  props.save(record);

  // Log the save action
  props.addLogEntry("success", `Scenario saved: ${props.scenarioName}`, {
    nodeCount: currentNodes.length,
    edgeCount: currentEdges.length,
    scenarioId: id,
  });

  props.setSavingFlash("Saved");
  setTimeout(() => props.setSavingFlash(null), 1200);

  // Debug payload for manual save - Enhanced with full state snapshot and diff info for backend team
  props.emitDebugPayload("scenarioBuilder.save.manual", {
    scenarioId: id,
    scenarioName: props.scenarioName,
    nodeCount: currentNodes.length,
    edgeCount: currentEdges.length,
    modules,
    // Full state snapshot for backend persistence
    fullState: {
      scenarioId: id,
      scenarioName: props.scenarioName,
      notes: props.notes,
      nodes: currentNodes.map((n: Node<RFData>) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        selected: n.selected,
        dragging: n.dragging,
      })),
      edges: currentEdges.map((e: Edge<RFData>) => ({
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
      action: "manual_save",
      timestamp: new Date().toISOString(),
      previousNodeCount: props.nodes.length,
      previousEdgeCount: props.edges.length,
      changes: "manual save performed",
    },
  });
};

// Node deletion function
export const deleteNode = (
  id: string,
  props: ScenarioServicesProps
) => {
  const nodeToDelete = props.nodes.find((n) => n.id === id);
  const nodeName =
    nodeToDelete?.data?.label || nodeToDelete?.type || "Unknown node";

  // prevent selection-change handler from reopening drawer during deletion
  props.suppressOpenRef.current = true;
  props.pushUndo(props.nodes, props.edges);
  props.setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  const newNodes = props.nodes.filter((n) => n.id !== id) as Node<RFData>[];

  // Auto-restore initial node if no nodes left
  if (newNodes.length === 0) {
    const rect = (
      props.rf.current as HTMLElement | null
    )?.getBoundingClientRect?.();
    const cx = rect
      ? Math.max(0, Math.round(rect.width / 2 - 200 / 2))
      : 240;
    const cy = rect
      ? Math.max(0, Math.round(rect.height / 2 - 100 / 2))
      : 180;
    const initial: Node<RFData> = {
      id: "initial",
      type: "initial",
      position: { x: cx, y: cy },
      data: { label: "Start" },
    };
    props.setNodes([initial]);
  } else {
    props.setNodes(newNodes);
  }

  if (props.selectedId === id) {
    props.setSelectedId(null);
    props.setDrawerOpen(false);
  }

  // Log the deletion
  props.addLogEntry("warning", `Deleted node: ${nodeName}`, {
    nodeId: id,
    nodeType: nodeToDelete?.type,
  });

  // Auto-save on change using the computed post-delete state
  const finalNodes =
    newNodes.length === 0
      ? [
          (() => {
            const rect = (
              props.rf.current as HTMLElement | null
            )?.getBoundingClientRect?.();
            const cx = rect
              ? Math.max(0, Math.round(rect.width / 2 - 200 / 2))
              : 240;
            const cy = rect
              ? Math.max(0, Math.round(rect.height / 2 - 100 / 2))
              : 180;
            return {
              id: "initial",
              type: "initial",
              position: { x: cx, y: cy },
              data: { label: "Start" },
            } as Node<RFData>;
          })(),
        ]
      : newNodes;
  const finalEdges = props.edges.filter(
    (x) =>
      finalNodes.some((n) => n.id === x.source) &&
      finalNodes.some((n) => n.id === x.target)
  );

  // Debug payload for node deletion - Enhanced with full state snapshot and diff info for backend team
  props.emitDebugPayload("scenarioBuilder.node.delete", {
    nodeId: id,
    nodeName,
    nodeType: nodeToDelete?.type,
    scenarioId: props.scenarioId,
    // Full state snapshot for backend persistence
    fullState: {
      scenarioId: props.scenarioId,
      scenarioName: props.scenarioName,
      notes: props.notes,
      nodes: finalNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        selected: n.selected,
        dragging: n.dragging,
      })),
      edges: finalEdges.map((e) => ({
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
      action: "node_deleted",
      timestamp: new Date().toISOString(),
      nodeId: id,
      nodeName,
      nodeType: nodeToDelete?.type,
      changes: `Deleted node: ${nodeName}`,
    },
  });

  setTimeout(
    () => handleSave(props, { nodes: finalNodes, edges: finalEdges }),
    100
  );
  // re-enable opening after state settles
  setTimeout(() => {
    props.suppressOpenRef.current = false;
  }, 200);
};

// Node change function
export const changeNode = (
  draft: Node<RFData>,
  props: ScenarioServicesProps
) => {
  props.pushUndo(props.nodes, props.edges);
  props.setNodes(
    (nds) =>
      nds.map((n) =>
        n.id === draft.id ? { ...n, data: draft.data } : n
      ) as Node<RFData>[]
  );
  // Check if changes were made
  const checkForChanges = (currentData: RFData) => {
    if (!props.originalNodeData) return false;
    return JSON.stringify(currentData) !== JSON.stringify(props.originalNodeData);
  };
  props.setHasUnsavedChanges(checkForChanges(draft.data as RFData));

  // Debug payload for node changes - Enhanced with full state snapshot and diff info for backend team
  props.emitDebugPayload("scenarioBuilder.node.change", {
    nodeId: draft.id,
    nodeType: draft.type,
    nodeData: draft.data,
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
      action: "node_changed",
      timestamp: new Date().toISOString(),
      nodeId: draft.id,
      previousData: props.originalNodeData,
      newData: draft.data,
      changes: "Node data modified",
    },
  });
};

// Version management functions
export const snapshotVersion = (props: ScenarioServicesProps) => {
  const v = {
    id: uid("v"),
    name: `${props.scenarioName} - ${new Date().toLocaleString()}`,
    ts: Date.now(),
    data: { nodes: props.nodes, edges: props.edges, name: props.scenarioName, notes: props.notes },
  };
  const vs = [v, ...props.versions].slice(0, 20);
  props.setVersions(vs);
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(vs));
};

export const restoreVersion = (
  v: any,
  props: ScenarioServicesProps
) => {
  props.pushUndo(props.nodes, props.edges);
  props.setNodes(structuredClone(v.data.nodes));
  props.setEdges(structuredClone(v.data.edges));
  props.setScenarioName(v.data.name);
  props.setNotes(v.data.notes);
  props.setShowVersions(false);
};
