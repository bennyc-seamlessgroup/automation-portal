import { load, saveAll } from "./_store.local";
import type { Scenario } from "./_store.local";

// Simulate API delay for save operation (6 seconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function saveScenarioLocal(record: Scenario): Promise<Scenario> {
  // Simulate 6 second API delay
  await sleep(6000);

  const db = load();
  const idx = db.findIndex((s) => s.id === record.id);
  const now = new Date().toISOString();

  if (idx === -1) {
    const toSave: Scenario = { ...record, updatedAt: now };
    db.push(toSave);
    saveAll(db);
    return toSave;
  } else {
    const merged: Scenario = { ...db[idx], ...record, updatedAt: now };
    db[idx] = merged;
    saveAll(db);
    return merged;
  }
}
