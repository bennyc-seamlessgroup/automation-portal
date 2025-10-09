import { updateScenarioLocal } from "./updateScenario.local";
import type { ScenarioStatus } from "./_store.local";

export function setStatusLocal(id: string, status: ScenarioStatus) {
  return updateScenarioLocal(id, { status });
}
