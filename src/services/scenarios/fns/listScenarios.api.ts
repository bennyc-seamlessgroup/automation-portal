// src/services/scenarios/fns/listScenarios.api.ts
import type { ScenarioListParams, ScenarioListResult } from "../../../types/scenarios";

/**
 * API implementation for listing scenarios
 * Uncomment and implement when ready for API mode
 */
export async function listScenariosApi(params: ScenarioListParams): Promise<ScenarioListResult> {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.append('q', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`/api/scenarios?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw { code: "API_ERROR", message: `Failed to fetch scenarios: ${response.statusText}` };
  }

  return response.json();
}
