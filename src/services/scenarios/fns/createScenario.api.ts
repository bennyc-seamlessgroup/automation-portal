// src/services/scenarios/fns/createScenario.api.ts
import type { Scenario } from "../../../types/scenarios";
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for creating scenarios
 */
export async function createScenarioApi(input: Partial<Scenario>): Promise<Scenario> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  const response = await fetch(`${API_BASE_URL}/scenarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw { code: "API_ERROR", message: `Failed to create scenario: ${response.statusText}` };
  }

  return response.json();
}
