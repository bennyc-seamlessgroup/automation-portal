import { load, saveAll } from "./_store.local";
import type { Scenario } from "./_store.local";

// Simulate API delay for update operation (6 seconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function updateScenarioLocal(id: string, patch: Partial<Scenario>): Promise<Scenario | undefined> {
  // Simulate 6 second API delay
  await sleep(6000);

  const db = load();
  const idx = db.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString();
  const next: Scenario = { ...db[idx], ...patch, updatedAt: now };
  db[idx] = next;
  saveAll(db);
  return next;
}
