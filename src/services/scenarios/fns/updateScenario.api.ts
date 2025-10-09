// src/services/scenarios/fns/updateScenario.api.ts
import type { Scenario } from "../../../types/scenarios";
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for updating scenarios
 */
export async function updateScenarioApi(id: string, patch: Partial<Scenario>): Promise<Scenario> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  const response = await fetch(`${API_BASE_URL}/scenarios/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
    }
    throw { code: "API_ERROR", message: `Failed to update scenario: ${response.statusText}` };
  }

  return response.json();
}
