import { load } from "./_store.local";
import type { Scenario } from "./_store.local";

export function getScenarioLocal(id: string): Scenario | undefined {
  const db = load();
  return db.find((s) => s.id === id);
}
