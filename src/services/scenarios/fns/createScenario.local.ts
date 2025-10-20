import { load, saveAll, genId } from "./_store.local";
import type { Scenario } from "./_store.local";

// Simulate API delay for create operation (6 seconds)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

type CreateInput = Omit<Scenario, "id" | "status"> & Partial<Pick<Scenario, "status">>;

export async function createScenarioLocal(input: CreateInput): Promise<Scenario> {
  // Simulate 6 second API delay
  await sleep(6000);

  const now = new Date().toISOString();
  const record: Scenario = {
    id: genId(),
    title: input.title || "Untitled Scenario",
    status: input.status || "stopped",
    owner: input.owner || "BC",
    createdAt: now,
    updatedAt: now,
    graph: input.graph ?? { nodes: [], edges: [], name: input.title || "Untitled Scenario", notes: "" },
  };

  const db = load();
  db.push(record);
  saveAll(db);
  return record;
}
