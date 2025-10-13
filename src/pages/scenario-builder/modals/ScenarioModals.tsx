import React from "react";
import { Modal } from "../components/Modal";
import { builderStyles } from "../styles";
import type { ScenarioFunctionsProps } from "../../../services/scenarios/fns/scenarioBuilderFunctions.local";

interface ExplainFlowModalProps {
  showExplain: boolean;
  setShowExplain: React.Dispatch<React.SetStateAction<boolean>>;
  explainFlowText: () => string;
}

export const ExplainFlowModal: React.FC<ExplainFlowModalProps> = ({
  showExplain,
  setShowExplain,
  explainFlowText,
}) => (
  <>
    {showExplain && (
      <Modal onClose={() => setShowExplain(false)} title="Explain Flow">
        <pre
          style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5 }}
        >
          {explainFlowText()}
        </pre>
      </Modal>
    )}
  </>
);

interface IOModalProps {
  showIO: boolean;
  setShowIO: React.Dispatch<React.SetStateAction<boolean>>;
}

export const IOModal: React.FC<IOModalProps> = ({ showIO, setShowIO }) => (
  <>
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
  </>
);

interface SettingsModalProps extends ScenarioFunctionsProps {
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  snapshotVersion: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettings,
  setShowSettings,
  scenarioName,
  setScenarioName,
  scheduleEnabled,
  setScheduleEnabled,
  interval,
  setIntervalStr,
  handleSave,
  snapshotVersion,
}) => (
  <>
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
                // Auto-save when scenario name changes
                setTimeout(() => handleSave(), 100);
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
                  // Auto-save when schedule changes
                  setTimeout(() => handleSave(), 100);
                }}
              />
              <span>Enable schedule</span>
            </label>
            {scheduleEnabled && (
              <select
                value={interval}
                onChange={(e) => {
                  setIntervalStr(e.target.value as "15m" | "1h" | "1d");
                  // Auto-save when schedule changes
                  setTimeout(() => handleSave(), 100);
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
  </>
);

interface NotesModalProps {
  showNotes: boolean;
  setShowNotes: React.Dispatch<React.SetStateAction<boolean>>;
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({
  showNotes,
  setShowNotes,
  notes,
  setNotes,
  handleSave,
}) => (
  <>
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
  </>
);

interface VersionsModalProps {
  showVersions: boolean;
  setShowVersions: React.Dispatch<React.SetStateAction<boolean>>;
  versions: any[];
  setVersions: React.Dispatch<React.SetStateAction<any[]>>;
  snapshotVersion: () => void;
  restoreVersion: (v: any) => void;
  scenarioName: string;
}

export const VersionsModal: React.FC<VersionsModalProps> = ({
  showVersions,
  setShowVersions,
  versions,
  setVersions,
  snapshotVersion,
  restoreVersion,
  scenarioName: _scenarioName,
}) => (
  <>
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
                    localStorage.setItem("automationPortal.scenarioBuilder.versions", JSON.stringify(vs));
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
  </>
);
