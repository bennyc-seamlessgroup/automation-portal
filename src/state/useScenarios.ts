// src/state/useScenarios.ts
import { useMemo } from "react";
import {
  type Scenario,
  type ScenarioListParams,
  type ScenarioStatus,
} from "../types/scenarios";
import { getScenariosService } from "../services/scenarios";

export function useScenarios() {
  const svc = useMemo(() => getScenariosService(), []);

  // Expose the raw service for now — we’ll add caching/loading later if needed.
  return {
    list: (params: ScenarioListParams) => svc.list(params),
    get: (id: string) => svc.get(id),
    create: (input: Partial<Scenario>) => svc.create(input),
    update: (id: string, patch: Partial<Scenario>) => svc.update(id, patch),
    remove: (id: string) => svc.remove(id),
    setStatus: (id: string, status: ScenarioStatus) => svc.setStatus(id, status),
    snapshot: (id: string, note?: string) => svc.snapshot?.(id, note),
  };
}
