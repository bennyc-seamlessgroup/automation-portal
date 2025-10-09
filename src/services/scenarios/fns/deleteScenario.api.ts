// src/services/scenarios/fns/deleteScenario.api.ts
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for deleting scenarios
 */
export async function deleteScenarioApi(id: string): Promise<void> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  const response = await fetch(`${API_BASE_URL}/scenarios/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw { code: "NOT_FOUND", message: `Scenario ${id} not found` };
    }
    throw { code: "API_ERROR", message: `Failed to delete scenario: ${response.statusText}` };
  }

  // DELETE requests typically don't return content, so we just return void
}
