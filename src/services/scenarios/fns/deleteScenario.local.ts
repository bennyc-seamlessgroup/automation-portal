import { load, saveAll } from "./_store.local";

// Simulate API delay for delete operation (6 seconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function deleteScenarioLocal(id: string): Promise<boolean> {
  // Simulate 6 second API delay
  await sleep(6000);

  const db = load();
  const next = db.filter((s) => s.id !== id);
  const changed = next.length !== db.length;
  if (changed) saveAll(next);
  return changed;
}
