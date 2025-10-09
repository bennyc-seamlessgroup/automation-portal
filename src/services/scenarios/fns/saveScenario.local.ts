import { load, saveAll } from "./_store.local";
import type { Scenario } from "./_store.local";

export function saveScenarioLocal(record: Scenario): Scenario {
  const db = load();
  const idx = db.findIndex((s) => s.id === record.id);
  const now = new Date().toISOString();

  if (idx === -1) {
    const toSave: Scenario = { ...record, updatedAt: now, id: record.id || record.id };
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
