import { updateScenarioLocal } from "./updateScenario.local";
import type { ScenarioStatus, Scenario } from "./_store.local";

export async function setStatusLocal(id: string, status: ScenarioStatus): Promise<Scenario | undefined> {
  return updateScenarioLocal(id, { status });
}
