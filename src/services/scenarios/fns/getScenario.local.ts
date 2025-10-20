import { load } from "./_store.local";
import type { Scenario } from "./_store.local";

// Simulate API delay for get operation (6 seconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getScenarioLocal(id: string): Promise<Scenario | undefined> {
  // Simulate 6 second API delay
  await sleep(6000);

  const db = load();
  return db.find((s) => s.id === id);
}
