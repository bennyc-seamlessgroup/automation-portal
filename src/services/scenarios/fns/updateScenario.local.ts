import { load, saveAll } from "./_store.local";
import type { Scenario } from "./_store.local";

export function updateScenarioLocal(id: string, patch: Partial<Scenario>): Scenario | undefined {
  const db = load();
  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString();
  const next: Scenario = { ...db[idx], ...patch, updatedAt: now };
  db[idx] = next;
  saveAll(db);
  return next;
}
