import { load, saveAll } from "./_store.local";

export function deleteScenarioLocal(id: string): boolean {
  const db = load();
  const next = db.filter((s) => s.id !== id);
  const changed = next.length !== db.length;
  if (changed) saveAll(next);
  return changed;
}
