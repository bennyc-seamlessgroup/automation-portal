import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  MarkerType,
  ConnectionMode,
  type OnConnect,
  type NodeTypes,
  type Node,
  type Edge,
  type Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { useScenarios } from "../state";
import type { Scenario } from "../types/scenarios";
import type { RFData } from "./scenario-builder/types";
import {
  NODE_H,
  NODE_W,
  VERSIONS_KEY,
  ADD_NEXT_EVENT,
} from "./scenario-builder/constants";
import { builderStyles } from "./scenario-builder/styles";
import { getAppSpec, uid } from "./scenario-builder/utils";
import { useAutosave } from "./scenario-builder/hooks/useAutosave";
import {
  DebugPayloadUI,
  emitDebugPayload,
} from "./scenario-builder/debug/DebugPayloadUI";
import { InitialNode } from "./scenario-builder/components/InitialNode";
import { AppNode } from "./scenario-builder/components/AppNode";
import { Drawer } from "./scenario-builder/components/Drawer";
import { InspectorBody } from "./scenario-builder/components/InspectorBody";
import { FunctionPicker } from "./scenario-builder/components/FunctionPicker";
import { Tooltip } from "./scenario-builder/components/Tooltip";
import { LogWindow } from "./scenario-builder/components/LogWindow";
import type { LogEntry } from "./scenario-builder/components/LogWindow";
import { ConfirmDialog } from "./scenario-builder/components/ConfirmDialog";
import { Modal } from "./scenario-builder/components/Modal";

/** NODES */
const nodeTypes: NodeTypes = { initial: InitialNode, app: AppNode };

/** DRAWER */

/** TEST NODE TAB */

/** FUNCTION PICKER (two-pane) */

/** MAIN */
export default function ScenarioBuilder() {
  const { id } = useParams();
  return (
    <ReactFlowProvider>
      <EditorShell scenarioId={id ?? null} />
    </ReactFlowProvider>
  );
}

function EditorShell({ scenarioId }: { scenarioId: string | null }) {
  const { save, get } = useScenarios();
  const [nodes, setNodes, onNodesChange] = useNodesState<RFData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFData>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<{
    sourceId: string | null;
    replaceId?: string | null;
  } | null>(null);
  const rf = useRef<HTMLDivElement>(null);
  const [scenarioName, setScenarioName] = useState<string>("Unnamed Scenario");
  const [editingName, setEditingName] = useState<boolean>(false);

  // Track node changes for save prompt
  const [originalNodeData, setOriginalNodeData] = useState<RFData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Run/test/schedule state ---
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [interval, setIntervalStr] = useState<"15m" | "1h" | "1d">("15m");
  const [savingFlash, setSavingFlash] = useState<null | string>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("scenarioBuilder_autosaveEnabled");
      return saved !== null ? JSON.parse(saved) : true; // Default to true if not set
    } catch {
      return true; // Default to true if localStorage fails
    }
  });

  // --- Notes / settings / IO modals ---
  const [notes, setNotes] = useState<string>("");
  const [showExplain, setShowExplain] = useState(false);
  const [showIO, setShowIO] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // --- Confirmation dialogs ---
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: "danger" | "primary";
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  // --- Log system ---
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logWindowOpen, setLogWindowOpen] = useState(false);

  const addLogEntry = useCallback(
    (
      type: LogEntry["type"],
      message: string,
      details?: Record<string, unknown>
    ) => {
      const entry: LogEntry = {
        id: uid("log"),
        timestamp: new Date(),
        type,
        message,
        details,
      };
      setLogEntries((prev) => [entry, ...prev].slice(0, 100)); // Keep last 100 entries
    },
    [setLogEntries]
  );
  // (reserved) flag for future selection suppression needs
  const [savedId, setSavedId] = useState<string | null>(() =>
    scenarioId && scenarioId !== "new" ? scenarioId : null
  );
  const suppressOpenRef = useRef(false);

  // --- Versions (snapshots) ---
  type Version = {
    id: string;
    name: string;
    ts: number;
    data: {
      nodes: Node<RFData>[];
      edges: Edge<RFData>[];
      name: string;
      notes: string;
    };
  };
  const [versions, setVersions] = useState<Version[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(VERSIONS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // --- Undo / Redo stacks ---
  const [undo, setUndo] = useState<
    { nodes: Node<RFData>[]; edges: Edge<RFData>[] }[]
  >([]);
  const [redo, setRedo] = useState<
    { nodes: Node<RFData>[]; edges: Edge<RFData>[] }[]
  >([]);
  const pushUndo = useCallback(
    (n: Node<RFData>[], e: Edge<RFData>[]) =>
      setUndo((u) => [
        ...u,
        { nodes: structuredClone(n), edges: structuredClone(e) },
      ]),
    [setUndo]
  );

  // Save autosave setting to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("scenarioBuilder_autosaveEnabled", JSON.stringify(autosaveEnabled));
    } catch {
      // Ignore localStorage errors
    }
  }, [autosaveEnabled]);

  // Listen for plus button clicks on nodes to open function picker
  useEffect(() => {
    const onAddNext = (e: CustomEvent<{ id: string }>) => {
      const sourceId = e.detail?.id;
      if (sourceId) setPickerFor({ sourceId });
    };
    window.addEventListener(ADD_NEXT_EVENT, onAddNext as EventListener);
    return () =>
      window.removeEventListener(ADD_NEXT_EVENT, onAddNext as EventListener);
  }, []);

  // init with Initial node (centered)
  useEffect(() => {
    // Add initial log entry
    addLogEntry("info", "Scenario builder initialized", { scenarioId });

    // Prefer loading from shared store if an id is provided
    const loadScenario = async () => {
      if (scenarioId && scenarioId !== "new") {
        try {
          const existing = await get(scenarioId);
          if (existing?.graph) {
            const { nodes: n, edges: e, name, notes } = existing.graph || {};
            if (Array.isArray(n) && Array.isArray(e)) {
              setNodes(n as Node<RFData>[]);
              setEdges(e as Edge<RFData>[]);
              if (typeof name === "string" && name.trim()) setScenarioName(name);
              if (typeof notes === "string") setNotes(notes);
              addLogEntry("success", `Loaded scenario: ${name || "Untitled"}`, {
                nodeCount: n.length,
                edgeCount: e.length,
              });
              return;
            }
          }
        } catch (error) {
          console.warn("Failed to load scenario:", error);
        }
      }

      // Fallback to local draft - REMOVE this old localStorage approach (no longer needed with unified service)
      const rect = (rf.current as HTMLElement | null)?.getBoundingClientRect?.();
      const cx = rect
        ? Math.max(0, Math.round(rect.width / 2 - NODE_W / 2))
        : 240;
      const cy = rect
        ? Math.max(0, Math.round(rect.height / 2 - NODE_H / 2))
        : 180;
      const initial: Node<RFData> = {
        id: "initial",
        type: "initial",
        position: { x: cx, y: cy },
        data: { label: "Start" },
      };
      setNodes([initial]);
      setEdges([]);
      if (!scenarioId || scenarioId === "new") {
        setScenarioName("Unnamed Scenario");
        setNotes("");
        setSavedId(null);
      }
    };

    loadScenario();
  }, [setNodes, setEdges, scenarioId, get, addLogEntry]);

  // Unified save function for autosave
  const unifiedSave = useCallback(
    (data: {
      nodes: Node<RFData>[];
      edges: Edge<RFData>[];
      name: string;
      notes: string;
    }) => {
      const { nodes, edges, name, notes } = data;

      // Save local draft - REMOVE this old localStorage approach
      // localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      // Persist to shared scenarios store
      const id =
        savedId ??
        (scenarioId && scenarioId !== "new" ? scenarioId : uid("scn"));
      if (!savedId && (!scenarioId || scenarioId === "new")) setSavedId(id);
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
      save(record);

      // Log the save action
      addLogEntry("success", `Auto-saved: ${name}`, {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        scenarioId: id,
      });

      setSavingFlash("Auto-saved");
      setTimeout(() => setSavingFlash(null), 1200);

      // Debug payload for autosave - Enhanced with full state snapshot and diff info for backend team
      emitDebugPayload("scenarioBuilder.save.autosave", {
        id: id,
        name: name,
        nodes_count: nodes.length,
        edges_count: edges.length,
        modules_count: modules,
        // Full state snapshot for backend persistence
        full_state: {
          id: id,
          name: name,
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
          schedule_enabled: scheduleEnabled,
          interval,
        },
        // Minimal diff info for backend team
        diff: {
          action: "autosave",
          timestamp: new Date().toISOString(),
          nodes_count: nodes.length,
          edges_count: edges.length,
          changes: "auto-saved current state",
        },
      });
    },
    [savedId, scenarioId, save, scheduleEnabled, interval, addLogEntry]
  );

  // Setup autosave for all data changes
  const scenarioData = useMemo(
    () => ({
      nodes,
      edges,
      name: scenarioName,
      notes,
    }),
    [nodes, edges, scenarioName, notes]
  );

  // Setup autosave for all data changes (only when enabled and not a new scenario)
  const { isSaving: isAutosaving, lastSaved: lastAutosaveTime } = useAutosave(
    scenarioData,
    (autosaveEnabled && (scenarioId !== "new" && savedId)) ? unifiedSave : () => {}, // No-op function when autosave is disabled or for new scenarios
    2000 // 2 second debounce
  );

  // Update autosave status (only log when actual autosave occurred)
  useEffect(() => {
    if (lastAutosaveTime && autosaveEnabled && (scenarioId !== "new" && savedId)) {
      console.log(`Autosave completed at ${lastAutosaveTime}`);
    }
  }, [isAutosaving, lastAutosaveTime, autosaveEnabled, scenarioId, savedId]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      pushUndo(nodes, edges);
      setEdges((eds) =>
        addEdge(
          {
            id: uid("e"),
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );

      // Log the connection
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      const sourceName =
        sourceNode?.data?.label || sourceNode?.type || "Unknown";
      const targetName =
        targetNode?.data?.label || targetNode?.type || "Unknown";

      addLogEntry("info", `Connected: ${sourceName} -> ${targetName}`, {
        source_id: params.source,
        target_id: params.target,
        edge_id: uid("e"),
      });

      // Debug payload for edge creation - Enhanced with full state snapshot and diff info for backend team
      emitDebugPayload("scenarioBuilder.edge.create", {
        source_id: params.source,
        target_id: params.target,
        edge_id: uid("e"),
        source_name: sourceName,
        target_name: targetName,
        scenario_id: scenarioId,
        // Full state snapshot for backend persistence
        full_state: {
          scenario_id: scenarioId,
          scenario_name: scenarioName,
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
          schedule_enabled: scheduleEnabled,
          interval,
        },
        // Minimal diff info for backend team
        diff: {
          action: "edge_created",
          timestamp: new Date().toISOString(),
          source_id: params.source,
          target_id: params.target,
          source_name: sourceName,
          target_name: targetName,
          changes: `Connected: ${sourceName} -> ${targetName}`,
        },
      });
    },
    [
      setEdges,
      nodes,
      edges,
      scenarioId,
      scheduleEnabled,
      interval,
      scenarioName,
      notes,
      addLogEntry,
      pushUndo,
    ]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  // Check if current node data differs from original
  const checkForChanges = (currentData: RFData) => {
    if (!originalNodeData) return false;
    return JSON.stringify(currentData) !== JSON.stringify(originalNodeData);
  };

  const changeNode = (draft: Node<RFData>) => {
    pushUndo(nodes, edges);
    setNodes(
      (nds) =>
        nds.map((n) =>
          n.id === draft.id ? { ...n, data: draft.data } : n
        ) as Node<RFData>[]
    );
    // Check if changes were made
    setHasUnsavedChanges(checkForChanges(draft.data as RFData));

    // Debug payload for node changes - Enhanced with full state snapshot and diff info for backend team
    emitDebugPayload("scenarioBuilder.node.change", {
      node_id: draft.id,
      node_type: draft.type,
      node_data: draft.data,
      scenario_id: scenarioId,
      // Full state snapshot for backend persistence
      full_state: {
        scenario_id: scenarioId,
        scenario_name: scenarioName,
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
        schedule_enabled: scheduleEnabled,
        interval,
      },
      // Minimal diff info for backend team
      diff: {
        action: "node_changed",
        timestamp: new Date().toISOString(),
        node_id: draft.id,
        previous_data: originalNodeData,
        new_data: draft.data,
        changes: "Node data modified",
      },
    });
  };

  // Handle closing drawer with save prompt
  const handleCloseDrawer = useCallback(() => {
    if (hasUnsavedChanges) {
      setConfirmDialog({
        open: true,
        title: "Unsaved Changes",
        message:
          "You have unsaved changes. Do you want to save them before closing?",
        confirmText: "Save & Close",
        cancelText: "Discard",
        confirmStyle: "primary",
        onConfirm: () => {
          setDrawerOpen(false);
          setHasUnsavedChanges(false);
          setOriginalNodeData(null);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
        onCancel: () => {
          setDrawerOpen(false);
          setHasUnsavedChanges(false);
          setOriginalNodeData(null);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else {
      setDrawerOpen(false);
      setHasUnsavedChanges(false);
      setOriginalNodeData(null);
    }
  }, [
    hasUnsavedChanges,
    setConfirmDialog,
    setDrawerOpen,
    setHasUnsavedChanges,
    setOriginalNodeData,
  ]);

  const handleSave = useCallback(
    (override?: { nodes: Node<RFData>[]; edges: Edge<RFData>[] }) => {
      // Persist to shared scenarios store
      const id =
        savedId ??
        (scenarioId && scenarioId !== "new" ? scenarioId : uid("scn"));
      if (!savedId && (!scenarioId || scenarioId === "new")) setSavedId(id);
      const currentNodes = override?.nodes ?? nodes;
      const currentEdges = override?.edges ?? edges;
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
        title: scenarioName || "Untitled Scenario",
        meta,
        status: "stopped",
        owner: "BC",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        graph: {
          nodes: currentNodes,
          edges: currentEdges,
          name: scenarioName,
          notes,
        },
      };
      save(record);

      // Log the save action
      addLogEntry("success", `Scenario saved: ${scenarioName}`, {
        nodes_count: currentNodes.length,
        edges_count: currentEdges.length,
        scenario_id: id,
      });

      setSavingFlash("Saved");
      setTimeout(() => setSavingFlash(null), 1200);

      // Debug payload for manual save - Enhanced with full state snapshot and diff info for backend team
      emitDebugPayload("scenarioBuilder.save.manual", {
        id: id,
        name: scenarioName,
        nodes_count: currentNodes.length,
        edges_count: currentEdges.length,
        modules_count: modules,
        // Full state snapshot for backend persistence
        full_state: {
          id: id,
          name: scenarioName,
          notes,
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
          schedule_enabled: scheduleEnabled,
          interval,
        },
        // Minimal diff info for backend team
        diff: {
          action: "manual_save",
          timestamp: new Date().toISOString(),
          nodes_count: currentNodes.length,
          edges_count: currentEdges.length,
          changes: "manual save performed",
        },
      });
    },
    [
      addLogEntry,
      edges,
      interval,
      nodes,
      notes,
      save,
      scenarioId,
      scenarioName,
      savedId,
      scheduleEnabled,
      setSavedId,
      setSavingFlash,
    ]
  );

  const deleteNode = useCallback(
    (id: string) => {
      const nodeToDelete = nodes.find((n) => n.id === id);
      const nodeName =
        nodeToDelete?.data?.label || nodeToDelete?.type || "Unknown node";

      // prevent selection-change handler from reopening drawer during deletion
      suppressOpenRef.current = true;
      pushUndo(nodes, edges);
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      const newNodes = nodes.filter((n) => n.id !== id) as Node<RFData>[];

      // Auto-restore initial node if no nodes left
      if (newNodes.length === 0) {
        const rect = (
          rf.current as HTMLElement | null
        )?.getBoundingClientRect?.();
        const cx = rect
          ? Math.max(0, Math.round(rect.width / 2 - NODE_W / 2))
          : 240;
        const cy = rect
          ? Math.max(0, Math.round(rect.height / 2 - NODE_H / 2))
          : 180;
        const initial: Node<RFData> = {
          id: "initial",
          type: "initial",
          position: { x: cx, y: cy },
          data: { label: "Start" },
        };
        setNodes([initial]);
      } else {
        setNodes(newNodes);
      }

      if (selectedId === id) {
        setSelectedId(null);
        setDrawerOpen(false);
      }

      // Log the deletion
      addLogEntry("warning", `Deleted node: ${nodeName}`, {
        node_id: id,
        node_type: nodeToDelete?.type,
      });

      // Auto-save on change using the computed post-delete state
      const finalNodes =
        newNodes.length === 0
          ? [
              (() => {
                const rect = (
                  rf.current as HTMLElement | null
                )?.getBoundingClientRect?.();
                const cx = rect
                  ? Math.max(0, Math.round(rect.width / 2 - NODE_W / 2))
                  : 240;
                const cy = rect
                  ? Math.max(0, Math.round(rect.height / 2 - NODE_H / 2))
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
      const finalEdges = edges.filter(
        (x) =>
          finalNodes.some((n) => n.id === x.source) &&
          finalNodes.some((n) => n.id === x.target)
      );

      // Debug payload for node deletion - Enhanced with full state snapshot and diff info for backend team
      emitDebugPayload("scenarioBuilder.node.delete", {
        node_id: id,
        node_name: nodeName,
        node_type: nodeToDelete?.type,
        scenario_id: scenarioId,
        // Full state snapshot for backend persistence
        full_state: {
          scenario_id: scenarioId,
          scenario_name: scenarioName,
          notes,
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
          schedule_enabled: scheduleEnabled,
          interval,
        },
        // Minimal diff info for backend team
        diff: {
          action: "node_deleted",
          timestamp: new Date().toISOString(),
          node_id: id,
          node_name: nodeName,
          node_type: nodeToDelete?.type,
          changes: `Deleted node: ${nodeName}`,
        },
      });

      setTimeout(
        () => handleSave({ nodes: finalNodes, edges: finalEdges }),
        100
      );
      // re-enable opening after state settles
      setTimeout(() => {
        suppressOpenRef.current = false;
      }, 200);
    },
    [
      addLogEntry,
      edges,
      handleSave,
      interval,
      nodes,
      notes,
      pushUndo,
      scheduleEnabled,
      scenarioId,
      scenarioName,
      selectedId,
      setDrawerOpen,
      setEdges,
      setNodes,
      setSelectedId,
    ]
  );

  const handleTestRun = useCallback(() => {
    emitDebugPayload("scenarioBuilder.test.start", {
      nodes_count: nodes.length,
      edges_count: edges.length,
      scenario_id: scenarioId,
    });
    addLogEntry("info", "Test run started", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
    alert(
      "Test run: this would execute in dry-run mode.\n(Stub) Nodes: " +
        nodes.length +
        ", Edges: " +
        edges.length
    );
    addLogEntry("success", "Test run completed", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
  }, [nodes, edges, scenarioId, addLogEntry]);

  const handleUndo = useCallback(() => {
    const last = undo[undo.length - 1];
    if (!last) return;
    setUndo((u) => u.slice(0, -1));
    setRedo((r) => [
      ...r,
      { nodes: structuredClone(nodes), edges: structuredClone(edges) },
    ]);
    setNodes(structuredClone(last.nodes));
    setEdges(structuredClone(last.edges));
    addLogEntry("info", "Undo action performed", {
      nodeCount: last.nodes.length,
      edgeCount: last.edges.length,
    });
  }, [addLogEntry, edges, nodes, undo, setEdges, setNodes]);

  const handleRedo = useCallback(() => {
    const last = redo[redo.length - 1];
    if (!last) return;
    setRedo((r) => r.slice(0, -1));
    setUndo((u) => [
      ...u,
      { nodes: structuredClone(nodes), edges: structuredClone(edges) },
    ]);
    setNodes(structuredClone(last.nodes));
    setEdges(structuredClone(last.edges));
    addLogEntry("info", "Redo action performed", {
      nodeCount: last.nodes.length,
      edgeCount: last.edges.length,
    });
  }, [addLogEntry, edges, nodes, redo, setEdges, setNodes]);

  // keyboard shortcuts
  useEffect(() => {
    const closeDialog = () =>
      setConfirmDialog((prev) => ({ ...prev, open: false }));

    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNode) {
        e.preventDefault();
        setConfirmDialog({
          open: true,
          title: "Delete Node",
          message:
            "Are you sure you want to delete this node? This action cannot be undone.",
          confirmText: "Delete",
          cancelText: "Cancel",
          confirmStyle: "danger",
          onConfirm: () => {
            deleteNode(selectedNode.id);
            setSelectedId(null);
            setDrawerOpen(false);
            setHasUnsavedChanges(false);
            setOriginalNodeData(null);
            closeDialog();
          },
          onCancel: () => {
            closeDialog();
          },
        });
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault(); /* Auto-save is now automatic */
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") {
        e.preventDefault();
        handleTestRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedNode, deleteNode, handleUndo, handleRedo, handleTestRun]);
  // --- Actions ---
  function handleRunOnce() {
    addLogEntry("info", "Scenario execution started", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
    alert("Run once: executing the scenario now.\n(Stub)");
    addLogEntry("success", "Scenario execution completed", {
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });
  }
  function handlePublish() {
    addLogEntry("success", "Scenario published", {
      scenarioName,
      nodeCount: nodes.length,
    });
    alert("Published (stub): expose this scenario for production runs.");
  }
  function autoAlign() {
    // naive left-to-right layout by BFS from initial
    const start = nodes.find((n) => n.type === "initial") ?? nodes[0];
    if (!start) return;
    const adj = new Map<string, string[]>();
    edges.forEach((e) => {
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
    const newNodes = nodes.map((n) => {
      const lv = level.get(n.id) ?? 0;
      const siblings = grouped.get(lv) || [];
      const idx = siblings.indexOf(n.id);
      const y = centerY + (idx - (siblings.length - 1) / 2) * spacingY;
      const x = 100 + lv * spacingX;
      return { ...n, position: { x, y } };
    });
    pushUndo(nodes, edges);
    setNodes(newNodes as Node<RFData>[]);
    addLogEntry("info", "Auto-aligned nodes", { nodeCount: newNodes.length });
  }

  function explainFlowText() {
    const nameOf = (id: string) =>
      (nodes.find((n) => n.id === id)?.data as RFData)?.label ||
      nodes.find((n) => n.id === id)?.type ||
      id;
    const outsOf = (id: string) =>
      edges.filter((e) => e.source === id).map((e) => e.target);
    const start = nodes.find((n) => n.type === "initial")?.id || nodes[0]?.id;
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
  }

  function exportBlueprint() {
    const data = {
      name: scenarioName,
      notes,
      nodes,
      edges,
      scheduleEnabled,
      interval,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scenarioName.replace(/\s+/g, "_")}.blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  function importBlueprint(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result));
        if (obj.nodes && obj.edges) {
          pushUndo(nodes, edges);
          setNodes(obj.nodes);
          setEdges(obj.edges);
          if (obj.name) setScenarioName(obj.name);
          if (obj.notes) setNotes(obj.notes);
          if (typeof obj.scheduleEnabled === "boolean")
            setScheduleEnabled(obj.scheduleEnabled);
          if (obj.interval) setIntervalStr(obj.interval);
          // Only save if this is not a new scenario
          if (scenarioId !== "new") {
            handleSave();
          }
        } else {
          alert("Invalid blueprint file.");
        }
      } catch {
        alert("Failed to parse blueprint.");
      }
    };
    reader.readAsText(file);
  }

  function snapshotVersion() {
    const v: Version = {
      id: uid("v"),
      name: `${scenarioName} - ${new Date().toLocaleString()}`,
      ts: Date.now(),
      data: { nodes, edges, name: scenarioName, notes },
    };
    const vs = [v, ...versions].slice(0, 20);
    setVersions(vs);
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(vs));
  }
  function restoreVersion(v: Version) {
    pushUndo(nodes, edges);
    setNodes(structuredClone(v.data.nodes));
    setEdges(structuredClone(v.data.edges));
    setScenarioName(v.data.name);
    setNotes(v.data.notes);
    setShowVersions(false);
  }

  return (
    <div
      style={{ display: "flex", height: "calc(100vh - 64px)", width: "100%" }}
    >
      <div style={builderStyles.canvasWrap as React.CSSProperties}>
        <div style={{ position: "absolute", inset: 0 }} ref={rf}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(chs) => {
              pushUndo(nodes, edges);
              onNodesChange(chs);
            }}
            onEdgesChange={(chs) => {
              pushUndo(nodes, edges);
              onEdgesChange(chs);
            }}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            onPaneClick={() => {
              setDrawerOpen(
                false
              ); /* Close drawer when clicking empty canvas */
            }}
            onNodeClick={(_, n) => {
              if (n.type === "initial") {
                // Initial node does not use settings drawer; open function picker only
                setPickerFor({ sourceId: null, replaceId: n.id });
                return;
              }
              setSelectedId(n.id);
              setOriginalNodeData(structuredClone(n.data as RFData));
              setHasUnsavedChanges(false);
              setDrawerOpen(true);
            }}
            onSelectionChange={(sel) => {
              if (suppressOpenRef.current) return;
              // If picker is open, ignore selection changes to avoid UI conflicts (white screen flicker)
              if (pickerFor) return;
              const first =
                sel?.nodes && sel.nodes.length > 0 ? sel.nodes[0] : null;
              if (!first) return; // do not clear selection on blank canvas clicks
              if (first.type === "initial") return; // initial node has no settings drawer
              // Only open drawer if selection actually changed
              if (first.id !== selectedId) {
                setSelectedId(first.id);
                setOriginalNodeData(structuredClone(first.data as RFData));
                setHasUnsavedChanges(false);
                setDrawerOpen(true);
              }
            }}
            proOptions={{ hideAttribution: true }}
          >
            {/* Top-left header overlay */}
            <div style={builderStyles.headerOverlay as React.CSSProperties}>
              <button
                aria-label="Back"
                onClick={() => window.history.back()}
                style={builderStyles.backBtn as React.CSSProperties}
                className="d-inline-flex align-items-center gap-2"
              >
                <i className="bi bi-arrow-left-short" aria-hidden="true" />
                <span>Back</span>
              </button>
              {editingName ? (
                <input
                  autoFocus
                  value={scenarioName}
                  onChange={(e) => {
                    setScenarioName(e.target.value);
                  }}
                  onBlur={() => {
                    setEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingName(false);
                    }
                  }}
                  style={builderStyles.nameInput as React.CSSProperties}
                />
              ) : (
                <button
                  title="Click to rename"
                  onClick={() => setEditingName(true)}
                  style={builderStyles.nameBtn as React.CSSProperties}
                  className="d-inline-flex align-items-center gap-2"
                >
                  <span>{scenarioName}</span>
                  <i
                    className="bi bi-pencil-square text-muted"
                    aria-hidden="true"
                  />
                </button>
              )}
              {savingFlash && (
                <span
                  style={{ marginLeft: 8, fontSize: 12, color: "#16a34a" }}
                  className="d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-check-circle-fill" aria-hidden="true" />
                  {savingFlash}
                </span>
              )}
            </div>

            {/* Top action bar (Zapier-like) */}
            <div style={builderStyles.topActionBar as React.CSSProperties}>
              <Tooltip
                text="Manual Save"
                id="manual-save-btn"
                hoveredId={hoveredButton}
                onHover={setHoveredButton}
              >
                <button
                  style={builderStyles.pillBtn as React.CSSProperties}
                  className="d-inline-flex align-items-center gap-2"
                  onClick={() => handleSave()}
                >
                  <i className="bi bi-floppy" aria-hidden="true" />
                  Save
                </button>
              </Tooltip>
              <Tooltip
                text="Undo"
                id="undo-btn"
                hoveredId={hoveredButton}
                onHover={setHoveredButton}
              >
                <button
                  style={builderStyles.pillBtn as React.CSSProperties}
                  className="d-inline-flex align-items-center gap-2"
                  onClick={handleUndo}
                >
                  <i
                    className="bi bi-arrow-counterclockwise"
                    aria-hidden="true"
                  />
                  Undo
                </button>
              </Tooltip>
              <Tooltip
                text="Redo"
                id="redo-btn"
                hoveredId={hoveredButton}
                onHover={setHoveredButton}
              >
                <button
                  style={builderStyles.pillBtn as React.CSSProperties}
                  className="d-inline-flex align-items-center gap-2"
                  onClick={handleRedo}
                >
                  <i className="bi bi-arrow-clockwise" aria-hidden="true" />
                  Redo
                </button>
              </Tooltip>
              <Tooltip
                text="Test run"
                id="test-run-btn"
                hoveredId={hoveredButton}
                onHover={setHoveredButton}
              >
                <button
                  style={builderStyles.pillBtn as React.CSSProperties}
                  className="d-inline-flex align-items-center gap-2"
                  onClick={handleTestRun}
                >
                  <i className="bi bi-play-circle" aria-hidden="true" />
                  Test run
                </button>
              </Tooltip>
              <Tooltip
                text="Publish"
                id="publish-btn"
                hoveredId={hoveredButton}
                onHover={setHoveredButton}
              >
                <button
                  style={
                    {
                      ...builderStyles.pillBtn,
                      background: "#eefcf3",
                      borderColor: "#bbf7d0",
                    } as React.CSSProperties
                  }
                  className="d-inline-flex align-items-center gap-2"
                  onClick={handlePublish}
                >
                  <i className="bi bi-cloud-upload" aria-hidden="true" />
                  Publish
                </button>
              </Tooltip>
            </div>

            {/* Bottom action bar (Make-like) */}
            <div
              className="builder-bottom-bar"
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 70,
                zIndex: 10,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 8,
                boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "center",
              }}
            >
              {/* First row: Run controls */}
              <div style={builderStyles.bottomGroup as React.CSSProperties}>
                <Tooltip
                  text="Run once"
                  id="run-once-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={
                      {
                        ...builderStyles.pillBtn,
                        background: "#ede9fe",
                        borderColor: "#ddd6fe",
                        fontSize: 13,
                        lineHeight: "18px",
                      } as React.CSSProperties
                    }
                    className="d-inline-flex align-items-center gap-2"
                    onClick={handleRunOnce}
                  >
                    <i className="bi bi-play" aria-hidden="true" />
                    Run once
                  </button>
                </Tooltip>
                <div style={builderStyles.toggleWrap as React.CSSProperties}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => {
                        setScheduleEnabled(e.target.checked);
                        if (scenarioId !== "new") {
                          setTimeout(() => handleSave(), 100);
                        }
                      }}
                    />
                    <span style={{ fontSize: 13, lineHeight: "18px" }}>
                      {scheduleEnabled ? "Scheduled" : "Every 15 min"}
                    </span>
                  </label>
                  {scheduleEnabled && (
                    <select
                      value={interval}
                      onChange={(e) => {
                        setIntervalStr(e.target.value as "15m" | "1h" | "1d");
                        if (scenarioId !== "new") {
                          setTimeout(() => handleSave(), 100);
                        }
                      }}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "4px 6px",
                        fontSize: 12,
                        background: "#fff",
                      }}
                    >
                      <option value="15m">Every 15 min</option>
                      <option value="1h">Every hour</option>
                      <option value="1d">Daily</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Second row: Action icons */}
              <div style={builderStyles.bottomGroup as React.CSSProperties}>
                <Tooltip
                  text="Auto-align"
                  id="auto-align-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={autoAlign}
                  >
                    <i className="bi bi-bounding-box" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Explain flow"
                  id="explain-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setShowExplain(true)}
                  >
                    <i className="bi bi-stars" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Scenario I/O"
                  id="io-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setShowIO(true)}
                  >
                    <i className="bi bi-diagram-3" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Settings"
                  id="settings-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setShowSettings(true)}
                  >
                    <i className="bi bi-gear" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Notes"
                  id="notes-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setShowNotes(true)}
                  >
                    <i className="bi bi-journal-text" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Versions"
                  id="versions-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setShowVersions(true)}
                  >
                    <i className="bi bi-clock-history" aria-hidden="true" />
                  </button>
                </Tooltip>
                <Tooltip
                  text="Activity Log"
                  id="log-btn"
                  hoveredId={hoveredButton}
                  onHover={setHoveredButton}
                >
                  <button
                    style={
                      {
                        ...builderStyles.tinyBtn,
                        background: logWindowOpen ? "#e0e7ff" : "#fff",
                        borderColor: logWindowOpen ? "#6366f1" : "#e5e7eb",
                      } as React.CSSProperties
                    }
                    className="d-inline-flex align-items-center justify-content-center"
                    onClick={() => setLogWindowOpen(!logWindowOpen)}
                  >
                    <i className="bi bi-activity" aria-hidden="true" />
                  </button>
                </Tooltip>
                <div style={builderStyles.menuWrap as React.CSSProperties}>
                  <Tooltip
                    text="More"
                    id="more-btn"
                    hoveredId={hoveredButton}
                    onHover={setHoveredButton}
                  >
                    <button
                      style={builderStyles.tinyBtn as React.CSSProperties}
                      className="d-inline-flex align-items-center justify-content-center"
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <i className="bi bi-three-dots" aria-hidden="true" />
                    </button>
                  </Tooltip>
                  {menuOpen && (
                    <div
                      style={builderStyles.menuList as React.CSSProperties}
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div
                        style={builderStyles.menuItem as React.CSSProperties}
                        onClick={() => {
                          setMenuOpen(false);
                          exportBlueprint();
                        }}
                      >
                        Export blueprint
                      </div>
                      <label
                        style={
                          {
                            ...builderStyles.menuItem,
                            display: "block",
                          } as React.CSSProperties
                        }
                      >
                        Import blueprint
                        <input
                          type="file"
                          accept="application/json"
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setMenuOpen(false);
                              importBlueprint(f);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Background gap={24} />
            <MiniMap
              pannable
              zoomable
              style={{
                bottom: 60,
                right: 12,
              }}
            />
            <Controls
              style={{
                bottom: 60,
                left: 12,
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={handleCloseDrawer}>
        {selectedNode ? (
          <InspectorBody
            node={selectedNode as Node<RFData>}
            onChangeNode={changeNode}
            onDeleteNode={(id) => {
              setConfirmDialog({
                open: true,
                title: "Delete Node",
                message:
                  "Are you sure you want to delete this node? This action cannot be undone.",
                confirmText: "Delete",
                cancelText: "Cancel",
                confirmStyle: "danger",
                onConfirm: () => {
                  deleteNode(id);
                  setSelectedId(null);
                  setDrawerOpen(false);
                  setHasUnsavedChanges(false);
                  setOriginalNodeData(null);
                  setConfirmDialog({ ...confirmDialog, open: false });
                },
                onCancel: () => {
                  setConfirmDialog({ ...confirmDialog, open: false });
                },
              });
            }}
            onManualSave={handleSave}
            onClose={handleCloseDrawer}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9ca3af",
              fontSize: 14,
            }}
          >
            Select a node
          </div>
        )}
      </Drawer>

      <FunctionPicker
        open={!!pickerFor}
        onPick={(key) => {
          const spec = getAppSpec(key);
          const replaceId = pickerFor?.replaceId ?? null;
          const srcId = pickerFor?.sourceId ?? null;

          if (replaceId) {
            setNodes(
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
            addLogEntry("info", `Replaced node with: ${spec.name}`, {
              node_id: replaceId,
              app_key: key,
            });
            setPickerFor(null);
            setSelectedId(replaceId);
            setDrawerOpen(true);
            return;
          }

          const id = uid("app");
          const pos = srcId
            ? nodes.find((n) => n.id === srcId)?.position ?? { x: 200, y: 200 }
            : { x: 240, y: 180 };
          const newNode: Node<RFData> = {
            id,
            type: "app",
            position: { x: pos.x + 220, y: pos.y },
            data: { label: spec.name, appKey: key, values: {} },
          };
          pushUndo(nodes, edges);
          setNodes((nds) => nds.concat(newNode) as Node<RFData>[]);
          if (srcId)
            setEdges((eds) =>
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
          addLogEntry("success", `Added node: ${spec.name}`, {
            node_id: id,
            app_key: key,
            connected_from: srcId || null,
          });

          setPickerFor(null);
          setSelectedId(id);
          setDrawerOpen(true);
          // Auto-save when new node is added (only for existing scenarios)
          if (scenarioId !== "new") {
            setTimeout(() => handleSave(), 100);
          }

          // Debug payload for node creation - Enhanced with full state snapshot and diff info for backend team
          emitDebugPayload("scenarioBuilder.node.create", {
            node_id: id,
            node_name: spec.name,
            app_key: key,
            connected_from: srcId,
            scenario_id: scenarioId,
            // Full state snapshot for backend persistence
            full_state: {
              scenario_id: scenarioId,
              scenario_name: scenarioName,
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
              schedule_enabled: scheduleEnabled,
              interval,
            },
            // Minimal diff info for backend team
            diff: {
              action: "node_created",
              timestamp: new Date().toISOString(),
              node_id: id,
              node_type: "app",
              node_data: { label: spec.name, appKey: key, values: {} },
              connected_from: srcId,
              changes: `Added new node: ${spec.name}`,
            },
          });
        }}
        onClose={() => setPickerFor(null)}
        initialCategory="apps"
      />

      {/* Explain Flow modal */}
      {showExplain && (
        <Modal onClose={() => setShowExplain(false)} title="Explain Flow">
          <pre
            style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5 }}
          >
            {explainFlowText()}
          </pre>
        </Modal>
      )}

      {/* Inputs / Outputs modal (stub) */}
      {showIO && (
        <Modal
          onClose={() => setShowIO(false)}
          title="Scenario Inputs & Outputs"
        >
          <div style={{ fontSize: 13, color: "#374151" }}>
            <p>
              Define external inputs and outputs for this scenario (stub UI).
            </p>
            <ul>
              <li>Inputs: environment vars, secrets, manual params</li>
              <li>Outputs: return payloads, files, webhooks</li>
            </ul>
          </div>
        </Modal>
      )}

      {/* Settings modal */}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Scenario Settings">
          <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={builderStyles.formLabel}>Scenario name</div>
              <input
                style={builderStyles.input}
                value={scenarioName}
                onChange={(e) => {
                  setScenarioName(e.target.value);
                  // Auto-save when scenario name changes (only for existing scenarios)
                  if (scenarioId !== "new") {
                    setTimeout(() => handleSave(), 100);
                  }
                }}
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => {
                    setScheduleEnabled(e.target.checked);
                    // Auto-save when schedule changes (only for existing scenarios)
                    if (scenarioId !== "new") {
                      setTimeout(() => handleSave(), 100);
                    }
                  }}
                />
                <span>Enable schedule</span>
              </label>
              {scheduleEnabled && (
                <select
                  value={interval}
                  onChange={(e) => {
                    setIntervalStr(e.target.value as "15m" | "1h" | "1d");
                    // Auto-save when schedule changes (only for existing scenarios)
                    if (scenarioId !== "new") {
                      setTimeout(() => handleSave(), 100);
                    }
                  }}
                  style={
                    {
                      ...builderStyles.select,
                      width: 160,
                    } as React.CSSProperties
                  }
                >
                  <option value="15m">Every 15 minutes</option>
                  <option value="1h">Every hour</option>
                  <option value="1d">Daily</option>
                </select>
              )}
            </div>
            <button
              style={
                {
                  ...builderStyles.tinyBtn,
                  padding: "8px 12px",
                } as React.CSSProperties
              }
              onClick={() => {
                handleSave();
                snapshotVersion();
              }}
            >
              Save & snapshot
            </button>
          </div>
        </Modal>
      )}

      {/* Notes modal */}
      {showNotes && (
        <Modal onClose={() => setShowNotes(false)} title="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 10,
              fontSize: 13,
            }}
            placeholder="Write notes for collaborators..."
          />
          <div
            style={{
              marginTop: 8,
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            <button
              style={builderStyles.tinyBtn as React.CSSProperties}
              onClick={() => setNotes("")}
            >
              Clear
            </button>
            <button
              style={builderStyles.tinyBtn as React.CSSProperties}
              onClick={() => handleSave()}
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Versions modal */}
      {showVersions && (
        <Modal onClose={() => setShowVersions(false)} title="Versions">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 13, color: "#374151" }}>
              Local snapshots (max 20)
            </div>
            <button
              style={builderStyles.tinyBtn as React.CSSProperties}
              onClick={snapshotVersion}
            >
              Create snapshot
            </button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {versions.length === 0 && (
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                No versions yet.
              </div>
            )}
            {versions.map((v) => (
              <div
                key={v.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {new Date(v.ts).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    onClick={() => restoreVersion(v)}
                  >
                    Restore
                  </button>
                  <button
                    style={builderStyles.tinyBtn as React.CSSProperties}
                    onClick={() => {
                      const vs = versions.filter((x) => x.id !== v.id);
                      setVersions(vs);
                      localStorage.setItem(VERSIONS_KEY, JSON.stringify(vs));
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Log Window */}
      <LogWindow
        entries={logEntries}
        isOpen={logWindowOpen}
        onToggle={() => setLogWindowOpen(!logWindowOpen)}
        onClear={() => setLogEntries([])}
      />

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmStyle={confirmDialog.confirmStyle}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />

      {/* Debug UI */}
      <div style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: "8px",
        alignItems: "center",
        background: "#f8f9fa",
        border: "1px solid #e9ecef",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        color: "#6c757d",
        zIndex: 1000
      }}>
        <span>Autosave:</span>
        <div
          onClick={() => setAutosaveEnabled(!autosaveEnabled)}
          style={{
            position: "relative",
            width: "40px",
            height: "20px",
            background: autosaveEnabled ? "#28a745" : "#6c757d",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.2s"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "2px",
              left: autosaveEnabled ? "22px" : "2px",
              width: "16px",
              height: "16px",
              background: "white",
              borderRadius: "50%",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
            }}
          />
        </div>
      </div>
      <DebugPayloadUI />
    </div>
  );
}

/** Log Window Component */

/** Custom Confirmation Dialog */

/** Generic modal */
