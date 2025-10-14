// src/services/scenarios/scenarios.unified.ts
import type { Scenario, ScenarioListParams, ScenarioListResult, ScenarioStatus } from "../../types/scenarios";
import type { ScenariosService } from "./index";
import { STORAGE_MODE } from "../../config/featureFlag";

// Import local functions
import { listScenariosLocal } from "./fns/listScenarios.local";
import { getScenarioLocal } from "./fns/getScenario.local";
import { createScenarioLocal } from "./fns/createScenario.local";
import { updateScenarioLocal } from "./fns/updateScenario.local";
import { deleteScenarioLocal } from "./fns/deleteScenario.local";
import { setStatusLocal } from "./fns/setStatus.local";
import { saveScenarioLocal } from "./fns/saveScenario.local";

export const service: ScenariosService = {
  async list(params: ScenarioListParams): Promise<ScenarioListResult> {
    console.log(`[ScenariosService] list() called with params:`, params);
    return STORAGE_MODE === "api"
      ? (await import("./fns/listScenarios.api.ts")).listScenariosApi(params)
      : listScenariosLocal(params);
  },

  async get(id: string): Promise<Scenario> {
    console.log(`[ScenariosService] get() called with id: ${id}`);
    if (STORAGE_MODE === "api") {
      const { getScenarioApi } = await import("./fns/getScenario.api.ts");
      return getScenarioApi(id);
    } else {
      const result = getScenarioLocal(id);
      if (!result) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
      return result;
    }
  },

  async create(input: Partial<Scenario>): Promise<Scenario> {
    console.log(`[ScenariosService] create() called with input:`, input);
    return STORAGE_MODE === "api"
      ? (await import("./fns/createScenario.api.ts")).createScenarioApi(input as any)
      : createScenarioLocal(input as any);
  },

  async update(id: string, patch: Partial<Scenario>): Promise<Scenario> {
    console.log(`[ScenariosService] update() called with id: ${id}, patch:`, patch);
    if (STORAGE_MODE === "api") {
      const { updateScenarioApi } = await import("./fns/updateScenario.api.ts");
      return updateScenarioApi(id, patch);
    } else {
      const result = updateScenarioLocal(id, patch);
      if (!result) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
      return result;
    }
  },

  async remove(id: string): Promise<void> {
    console.log(`[ScenariosService] remove() called with id: ${id}`);
    if (STORAGE_MODE === "api") {
      const { deleteScenarioApi } = await import("./fns/deleteScenario.api.ts");
      return deleteScenarioApi(id);
    } else {
      const deleted = deleteScenarioLocal(id);
      if (!deleted) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
    }
  },

  async setStatus(id: string, status: ScenarioStatus): Promise<Scenario> {
    console.log(`[ScenariosService] setStatus() called with id: ${id}, status: ${status}`);
    if (STORAGE_MODE === "api") {
      const { setStatusApi } = await import("./fns/setStatus.api.ts");
      return setStatusApi(id, status);
    } else {
      const result = setStatusLocal(id, status);
      if (!result) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
      return result;
    }
  },

  async save(record: Scenario): Promise<Scenario> {
    console.log(`[ScenariosService] save() called with record id: ${record.id}`);
    return STORAGE_MODE === "api"
      ? (await import("./fns/saveScenario.api.ts")).saveScenarioApi(record)
      : saveScenarioLocal(record);
  },

  async snapshot(_id: string, _note?: string): Promise<{ snapshotId: string }> {
    console.log(`[ScenariosService] snapshot() called with id: ${_id}, note: ${_note}`);
    // This would need to be implemented for both API and local
    throw { code: "UNKNOWN", message: "Snapshot not implemented" };
  },
};
