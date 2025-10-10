import type { DebugEvent } from "../pages/scenarios/debug/DebugPayloadUI";
import { emitDebugPayload } from "../pages/scenarios/debug/DebugPayloadUI";
import type {
  Scenario,
  ScenarioListParams,
  ScenarioListResult,
} from "../services/scenarios";
import { getScenariosService } from "../services/scenarios";

const GLOBAL_HANDLE = "__AP_DEBUG__";
const SCENARIO_STORAGE_KEYS = [
  "ap.scenarios.v1",
  "automationPortal.scenarioBuilder.initialNode.v5",
  "automationPortal.scenarioBuilder.versions",
];

export type DebugLogger = ((message: string, ...rest: unknown[]) => void) & {
  info: (message: string, ...rest: unknown[]) => void;
  warn: (message: string, ...rest: unknown[]) => void;
  error: (message: string, ...rest: unknown[]) => void;
};

export type DebugTools = {
  env: string;
  listScenarios: (params?: ScenarioListParams) => Promise<ScenarioListResult>;
  getScenario: (id: string) => Promise<Scenario>;
  emitPayload: typeof emitDebugPayload;
  subscribeToPayloads: (listener: (event: DebugEvent) => void) => () => void;
  storage: {
    keys: () => string[];
    read: (key: string) => unknown;
    clear: (keys?: string[]) => void;
  };
  log: DebugLogger;
};

export type InstallDebugToolsOptions = {
  /** Force exposing the toolkit on window even in production builds. */
  expose?: boolean;
  /** Print console info once tools are ready. */
  verbose?: boolean;
};

export function createDebugLogger(namespace: string): DebugLogger {
  const prefix = `[${namespace}]`;
  const base = ((message: string, ...rest: unknown[]) => {
    console.debug(prefix, message, ...rest);
  }) as DebugLogger;

  base.info = (message: string, ...rest: unknown[]) => {
    console.info(prefix, message, ...rest);
  };
  base.warn = (message: string, ...rest: unknown[]) => {
    console.warn(prefix, message, ...rest);
  };
  base.error = (message: string, ...rest: unknown[]) => {
    console.error(prefix, message, ...rest);
  };

  return base;
}

function createTools(): DebugTools {
  const service = getScenariosService();
  return {
    env: import.meta.env.MODE,
    listScenarios: (params = {}) => service.list(params),
    getScenario: (id) => service.get(id),
    emitPayload: emitDebugPayload,
    subscribeToPayloads: (listener) => {
      if (typeof window === "undefined") return () => {};
      const handler = (event: Event) => {
        const detail = (event as CustomEvent<DebugEvent>).detail;
        listener(detail);
      };
      window.addEventListener("__debug_payload__", handler as EventListener);
      return () => window.removeEventListener("__debug_payload__", handler as EventListener);
    },
    storage: {
      keys: () => [...SCENARIO_STORAGE_KEYS],
      read: (key: string) => {
        if (typeof window === "undefined") return null;
        try {
          const raw = window.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      },
      clear: (keys = SCENARIO_STORAGE_KEYS) => {
        if (typeof window === "undefined") return;
        keys.forEach((key) => {
          try {
            window.localStorage.removeItem(key);
          } catch {
            /* swallow */
          }
        });
      },
    },
    log: createDebugLogger("automation-portal"),
  };
}

export function installDebugTools(options: InstallDebugToolsOptions = {}): DebugTools {
  const exposeByDefault = typeof window !== "undefined" && import.meta.env.DEV;
  const expose = options.expose ?? exposeByDefault;
  const verbose = options.verbose ?? expose;
  const tools = createTools();

  if (expose && typeof window !== "undefined") {
    const globalTarget = window as typeof window & { [GLOBAL_HANDLE]?: DebugTools };
    globalTarget[GLOBAL_HANDLE] = tools;

    if (verbose) {
      console.info(
        `[automation-portal] Debug tools attached at window.${GLOBAL_HANDLE}`,
        {
          env: tools.env,
          scenariosStorageKeys: tools.storage.keys(),
        }
      );
    }
  }

  return tools;
}

export function getInstalledDebugTools(): DebugTools | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as typeof window & { [GLOBAL_HANDLE]?: DebugTools })[GLOBAL_HANDLE];
}
