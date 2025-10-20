// src/services/scenarios/scenarios.local.ts
import type { Scenario, ScenarioListParams, ScenarioListResult, ScenarioStatus } from "../../types/scenarios";
import type { ScenariosService } from "./index";

import { listScenariosLocal } from "./fns/listScenarios.local";
import { getScenarioLocal } from "./fns/getScenario.local";
import { createScenarioLocal } from "./fns/createScenario.local";
import { updateScenarioLocal } from "./fns/updateScenario.local";
import { deleteScenarioLocal } from "./fns/deleteScenario.local";
import { setStatusLocal } from "./fns/setStatus.local";
import { saveScenarioLocal } from "./fns/saveScenario.local";

export const service: ScenariosService = {
    async list(params: ScenarioListParams): Promise<ScenarioListResult> {
      return await listScenariosLocal(params);
    },

  async get(id: string): Promise<Scenario> {
    const result = await getScenarioLocal(id);
    if (!result) {
      throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
    }
    return result;
  },

    async create(input: Partial<Scenario>): Promise<Scenario> {
      return await createScenarioLocal(input as any);
    },

    async update(id: string, patch: Partial<Scenario>): Promise<Scenario> {
      const result = await updateScenarioLocal(id, patch);
      if (!result) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
      return result;
    },

    async remove(id: string): Promise<void> {
      const deleted = await deleteScenarioLocal(id);
      if (!deleted) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
    },

    async setStatus(id: string, status: ScenarioStatus): Promise<Scenario> {
      const result = await setStatusLocal(id, status);
      if (!result) {
        throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
      }
      return result;
    },

    async save(record: Scenario): Promise<Scenario> {
      return await saveScenarioLocal(record);
    },

    // Optional in local mode; throw by default to match API parity unless you use it
    async snapshot(_id: string, _note?: string): Promise<{ snapshotId: string }> {
      throw { code: "UNKNOWN", message: "[Local] snapshot not implemented" };
    },
  };
  