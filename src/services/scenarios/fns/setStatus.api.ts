// src/services/scenarios/fns/setStatus.api.ts
import type { Scenario, ScenarioStatus } from "../../../types/scenarios";
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for setting scenario status
 */
export async function setStatusApi(id: string, status: ScenarioStatus): Promise<Scenario> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  const response = await fetch(`${API_BASE_URL}/scenarios/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
    }
    throw { code: "API_ERROR", message: `Failed to update scenario status: ${response.statusText}` };
  }

  return response.json();
}
