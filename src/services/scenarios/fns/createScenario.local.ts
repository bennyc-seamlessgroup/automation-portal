import { load, saveAll, genId } from "./_store.local";
import type { Scenario } from "./_store.local";

type CreateInput = Omit<Scenario, "id" | "status"> & Partial<Pick<Scenario, "status">>;

export function createScenarioLocal(input: CreateInput): Scenario {
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
