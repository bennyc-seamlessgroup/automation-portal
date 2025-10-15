// src/state/useScenarios.ts
import { useContext } from "react";
import { ScenariosContext } from "./ScenariosContext.context";
import {
  type Scenario,
  type ScenarioListParams,
  type ScenarioStatus,
} from "../types/scenarios";

export function useScenarios() {
  const context = useContext(ScenariosContext);

  if (!context) {
    throw new Error("useScenarios must be used within a ScenariosProvider");
  }

  return {
    scenarios: context.scenarios,
    isLoading: context.isLoading,
    refresh: context.refresh,
    save: context.save,
    remove: context.remove,
    get: context.get,
    preload: context.preload,
    // Legacy methods that throw - these should be implemented in context if needed
    list: (_params: ScenarioListParams) => context.refresh(),
    create: (_input: Partial<Scenario>) => {
      throw new Error("Not implemented - use ScenariosContext directly");
    },
    update: (_id: string, _patch: Partial<Scenario>) => {
      throw new Error("Not implemented - use ScenariosContext directly");
    },
    setStatus: (_id: string, _status: ScenarioStatus) => {
      throw new Error("Not implemented - use ScenariosContext directly");
    },
    snapshot: (_id: string, _note?: string) => {
      throw new Error("Not implemented - use ScenariosContext directly");
    },
  };
}
