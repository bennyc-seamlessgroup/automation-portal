// src/services/scenarios/fns/saveScenario.api.ts
import type { Scenario } from "../../../types/scenarios";
import { API_BASE_URL } from "../../../config/featureFlag";

/**
 * API implementation for saving scenarios
 * Note: This typically creates a new scenario or updates existing one
 */
export async function saveScenarioApi(record: Scenario): Promise<Scenario> {
  // TODO: Add authentication headers if required
  // const headers = { 'Authorization': `Bearer ${yourAuthToken}` };

  // Check if this is a new scenario (no ID) or existing (has ID)
  const isNew = !record.id || record.id.startsWith('scn_') || record.id === 'new';

  const url = isNew
    ? `${API_BASE_URL}/scenarios`
    : `${API_BASE_URL}/scenarios/${record.id}`;

  const response = await fetch(url, {
    method: isNew ? 'POST' : 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // ...headers, // Uncomment if auth needed
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    if (response.status === 404 && !isNew) {
      throw { code: "NOT_FOUND", message: `Scenario ${record.id} not found` };
    }
    throw { code: "API_ERROR", message: `Failed to save scenario: ${response.statusText}` };
  }

  return response.json();
}
