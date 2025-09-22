// src/state/scenarios.ts
export type Status = "running" | "stopped" | "error";
export type Scenario = {
  id: string;
  title: string;
  meta: string;
  status: Status;
  owner: string;        // initials
  lastModified: string; // human time
  updatedAt?: string;   // ISO timestamp (new)
  graph?: any;          // whatever ScenarioBuilder saves (nodes/edges/settings)
};

const KEY = "ap.scenarios.v1";

function read(): Scenario[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Scenario[];
  } catch {
    return [];
  }
}

function write(all: Scenario[]) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function listScenarios(): Scenario[] {
  return read();
}

export function getScenario(id: string): Scenario | undefined {
  return read().find(s => s.id === id);
}

export function upsertScenario(s: Scenario) {
  const all = read();
  const idx = all.findIndex(x => x.id === s.id);
  if (idx >= 0) all[idx] = s; else all.unshift(s);
  write(all);
}

export function deleteScenario(id: string) {
  write(read().filter(s => s.id !== id));
}

export function humanAgo(_d = new Date()) {
  // super simple; swap with dayjs later if you like
  return "just now";
}
  