import { useScenarios } from "../../../state/ScenariosContext";
import type { Scenario } from "../../../types/scenarios";
import { emitDebugPayload } from "../debug/DebugPayloadUI";

export default function ActionsDropdown({ scenarioId, onDelete }: { scenarioId?: string; onDelete?: () => void }) {
  const { get, save } = useScenarios();

  const rename = () => {
    if (!scenarioId) {
      console.error("No scenarioId provided to rename function");
      return;
    }

    console.log("Attempting to rename scenario:", scenarioId);

    // Debug: Check what's in localStorage
    const storedScenarios = localStorage.getItem("ap.scenarios.v1");
    console.log("Stored scenarios in localStorage:", storedScenarios ? JSON.parse(storedScenarios) : "None");
    console.log("Scenario ID being searched:", scenarioId);

    const s = get(scenarioId);

    if (!s) {
      console.error("Scenario not found:", scenarioId);
      console.log("Available scenario IDs in localStorage:", storedScenarios ?
        JSON.parse(storedScenarios).map((sc: any) => sc.id) : "None");
      alert("Scenario not found. Please refresh the page and try again.");
      return;
    }

    console.log("Found scenario:", s.title);
    const nextTitle = window.prompt("Rename scenario", s.title || "Untitled Scenario");

    if (nextTitle == null) {
      console.log("Rename cancelled by user");
      return; // cancelled
    }

    const newTitle = nextTitle.trim();
    if (!newTitle || newTitle === s.title) {
      console.log("No changes needed for rename");
      return;
    }

    console.log("Renaming from", s.title, "to", newTitle);
    const updated = {
      ...s,
      title: newTitle,
      graph: s.graph ? { ...s.graph, name: newTitle } : s.graph,
    };

    try {
      save(updated);
      console.log("Scenario renamed successfully");
      emitDebugPayload("scenarios.rename", { scenarioId, title: newTitle });
    } catch (error) {
      console.error("Failed to save renamed scenario:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const duplicate = () => {
    if (!scenarioId) {
      console.error("No scenarioId provided to duplicate function");
      return;
    }

    console.log("Attempting to duplicate scenario:", scenarioId);
    const s = get(scenarioId);

    if (!s) {
      console.error("Scenario not found:", scenarioId);
      alert("Scenario not found. Please refresh the page.");
      return;
    }

    console.log("Found scenario to duplicate:", s.title);

    const duplicated: Scenario = {
      ...s,
      id: crypto.randomUUID(),
      title: `${s.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      graph: s.graph ? { ...s.graph, name: `${s.title} (Copy)` } : s.graph,
    };

    console.log("Creating duplicate with title:", duplicated.title);

    try {
      save(duplicated);
      console.log("Scenario duplicated successfully");
      emitDebugPayload("scenarios.duplicate", {
        originalId: scenarioId,
        newId: duplicated.id,
        newTitle: duplicated.title,
      });
    } catch (error) {
      console.error("Failed to save duplicated scenario:", error);
      alert("Failed to duplicate scenario. Please try again.");
    }
  };

  return (
    <div className="dropdown">
      <button className="btn btn-sm btn-outline-dark" data-bs-toggle="dropdown" aria-label="More actions">
        <i className="bi bi-three-dots" />
      </button>
      <ul className="dropdown-menu dropdown-menu-end ws-menu">
        <li>
          <button className="dropdown-item" onClick={rename}>
            <i className="bi bi-pencil me-2" />
            Rename
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => emitDebugPayload("scenarios.history.open", { scenarioId })}
          >
            <i className="bi bi-clock-history me-2" />
            View history
          </button>
        </li>
        <li>
          <button className="dropdown-item" onClick={duplicate}>
            <i className="bi bi-layers me-2" />
            Duplicate
          </button>
        </li>
        <li>
          <button
            className="dropdown-item disabled"
            aria-disabled="true"
            onClick={() => emitDebugPayload("scenarios.changeOwner.disabled", { scenarioId })}
          >
            <i className="bi bi-person-gear me-2" />
            Change owner
          </button>
        </li>
        <li>
          <hr className="dropdown-divider" />
        </li>
        <li>
          <button
            className="dropdown-item text-danger"
            onClick={() => { if (onDelete) onDelete(); }}
          >
            <i className="bi bi-trash me-2" />
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
}
