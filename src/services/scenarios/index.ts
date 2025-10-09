// src/services/scenarios/index.ts
import type {
    Scenario,
    ScenarioListParams,
    ScenarioListResult,
    ScenarioStatus,
  } from "../../types/scenarios";
  import { STORAGE_MODE } from "../../config/featureFlag";
  import { service as localService } from "./scenarios.local";
  import { service as apiService } from "./scenarios.api";
  
  export interface ScenariosService {
    list(params: ScenarioListParams): Promise<ScenarioListResult>;
    get(id: string): Promise<Scenario>;
    create(input: Partial<Scenario>): Promise<Scenario>;
    update(id: string, patch: Partial<Scenario>): Promise<Scenario>;
    remove(id: string): Promise<void>;
    setStatus(id: string, status: ScenarioStatus): Promise<Scenario>;
    save(record: Scenario): Promise<Scenario>;
    snapshot?(id: string, note?: string): Promise<{ snapshotId: string }>;
  }
  
  /** Singleton accessor — UI/hook will call this, not the providers directly */
  let _service: ScenariosService | null = null;
  export function getScenariosService(): ScenariosService {
    if (_service) return _service;
    _service = STORAGE_MODE === "api" ? apiService : localService;
    return _service;
  }
  
  export type {
    Scenario,
    ScenarioListParams,
    ScenarioListResult,
    ScenarioStatus,
  } from "../../types/scenarios";

  export {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
  } from "../../types/scenarios";
  