/* ============================================================================
 * Shared Types: Scenarios
 * ----------------------------------------------------------------------------
 * Single source of truth for FE <-> Service contracts (API or LocalStorage).
 * No runtime deps. Keep this file pure TypeScript.
 * ========================================================================== */

/** ISO-8601 UTC timestamp string, e.g. "2025-10-09T03:12:45Z" */
export type ISODateString = string;

/** Current allowed scenario statuses */
export type ScenarioStatus = "running" | "stopped" | "error";

/* ----------------------------------------------------------------------------
 * Graph (stored with each scenario)
 * Keep minimal to avoid tight coupling with React Flow runtime types.
 * Providers should normalize to these shapes when persisting/loading.
 * -------------------------------------------------------------------------- */

export type NodeId = string;
export type EdgeId = string;

/** Minimal node shape for persistence */
export interface GraphNode {
  id: NodeId;
  /** Optional node kind (e.g., "gmailSend", "slackPost") */
  type?: string;
  /** Canvas position in pixels */
  position: { x: number; y: number };
  /** Arbitrary node payload/config */
  data?: Record<string, unknown>;
}

/** Minimal edge shape for persistence */
export interface GraphEdge {
  id: EdgeId;
  source: NodeId;
  target: NodeId;
  /** Optional edge kind (e.g., "default", "smoothstep") */
  type?: string;
  /** Arbitrary edge payload/config */
  data?: Record<string, unknown>;
}

/** Full graph payload */
export interface ScenarioGraph {
  /** Optional display name for the scenario graph (separate from scenario.title) */
  name?: string;
  /** Freeform notes/description for the scenario */
  notes?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ----------------------------------------------------------------------------
 * Core entity
 * -------------------------------------------------------------------------- */
export interface Scenario {
  id: string;                  // ULID/UUID (opaque to FE)
  title: string;               // e.g., "Weekly Email Summary"
  /** Short UI subtitle, e.g., "Every Mon 9:00 · 3 modules" */
  meta?: string;
  status: ScenarioStatus;      // running | stopped | error
  /** Two-letter initials for now (e.g., "BC"). Can evolve later. */
  owner: string;
  /** Server-authoritative in API mode; FE sets in local mode */
  createdAt: ISODateString;
  /** Server-authoritative in API mode; FE sets in local mode */
  updatedAt: ISODateString;

  /** The automation flow data */
  graph: ScenarioGraph;

  /** Optional tags/labels for filtering/grouping */
  tags?: string[];
}

/* ----------------------------------------------------------------------------
 * List & Query contracts
 * -------------------------------------------------------------------------- */
export interface ScenarioListParams {
  page?: number;        // default 1
  pageSize?: number;    // default 20 (max 100)
  search?: string;      // matches title/meta (case-insensitive, contains)
  status?: ScenarioStatus; // filter by exact status
  /** Future-proofing: add sort?: "updatedAt_desc" | "title_asc" | ... */
}

export interface ScenarioListResult {
  items: Scenario[];
  page: number;
  pageSize: number;
  total: number;        // total matching rows (for pagination UI)
}

/* ----------------------------------------------------------------------------
 * Error contract (thrown by service providers)
 * -------------------------------------------------------------------------- */
export interface ServiceError {
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "RATE_LIMITED"
    | "CONFLICT"
    | "NETWORK_ERROR"
    | "UNKNOWN";
  message: string;
  details?: unknown;
}

/** Type guard for ServiceError */
export function isServiceError(err: unknown): err is ServiceError {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in (err as Record<string, unknown>) &&
    typeof (err as Record<string, unknown>)["code"] === "string" &&
    "message" in (err as Record<string, unknown>) &&
    typeof (err as Record<string, unknown>)["message"] === "string"
  );
}

/* ----------------------------------------------------------------------------
 * Defaults & Limits (optional, used by both providers and UI)
 * -------------------------------------------------------------------------- */
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/** Soft cap for graph payloads (uncompressed JSON) */
export const GRAPH_SOFT_SIZE_LIMIT_BYTES = 2 * 1024 * 1024; // 2 MB

/* ----------------------------------------------------------------------------
 * Patch/Input helpers for service methods
 * -------------------------------------------------------------------------- */

/** Shape allowed when creating a new scenario */
export interface CreateScenarioInput {
  title?: string;
  meta?: string;
  status?: ScenarioStatus; // default "stopped"
  owner?: string;          // default current user initials
  graph?: ScenarioGraph;   // optional initial graph
  tags?: string[];
}

/** Shape allowed when updating an existing scenario */
export interface UpdateScenarioPatch {
  title?: string;
  meta?: string;
  status?: ScenarioStatus;
  owner?: string;
  graph?: ScenarioGraph;
  tags?: string[];
}

/* ----------------------------------------------------------------------------
 * UI-only helpers (types, not implementations)
 * -------------------------------------------------------------------------- */

/** Function signature for formatting "Last modified" from updatedAt */
export type LastModifiedFormatter = (updatedAt: ISODateString) => string;
