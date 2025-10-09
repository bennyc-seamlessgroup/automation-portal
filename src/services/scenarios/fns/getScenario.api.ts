// src/services/scenarios/fns/getScenario.api.ts
import type { Scenario } from "../../../types/scenarios";
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for getting a single scenario
 */
export async function getScenarioApi(id: string): Promise<Scenario> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  const response = await fetch(`${API_BASE_URL}/scenarios/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
    }
    throw { code: "API_ERROR", message: `Failed to fetch scenario: ${response.statusText}` };
  }

  return response.json();
}
