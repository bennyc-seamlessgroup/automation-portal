// src/state/scenarios.ts
import type { Scenario, ScenarioStatus } from "../types/scenarios";

// Re-export for backward compatibility
export type { Scenario, ScenarioStatus };

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
  