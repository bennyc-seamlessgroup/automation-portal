/*
  Connection Management Service
  ----------------------------
  - Handles persistent storage of app connections
  - Provides CRUD operations for connections
  - Supports Telegram, Gmail, and other app types
*/

export interface Connection {
  id: string;
  name: string;            // display name (e.g., account or bot)
  sub: string;             // secondary line, usually email/handle
  app: string;             // app name
  appVersion: string;      // version string
  scenarios: number;       // number of scenarios using this connection
  lastModified: string;    // e.g., "1 day ago"
  people: string[];        // initials of members with access
  brand: "telegram" | "sheets" | "gmail";
  // Extended fields for different app types
  type: "telegram" | "gmail" | "sheets";
  credentials?: {
    token?: string;        // For Telegram bots
    refreshToken?: string; // For OAuth apps
    accessToken?: string;  // For OAuth apps
  };
  metadata?: {
    botName?: string;      // For Telegram bots
    botUsername?: string;  // For Telegram bots
    email?: string;        // For Gmail
    scopes?: string[];     // For OAuth apps
  };
  createdAt: string;
  updatedAt: string;
}

const CONNECTIONS_KEY = 'automation_portal_connections';

// In-memory cache for performance
let connectionsCache: Connection[] | null = null;

/**
 * Get all connections from localStorage
 */
export function getConnections(): Connection[] {
  if (connectionsCache) {
    return connectionsCache;
  }

  try {
    const stored = localStorage.getItem(CONNECTIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      connectionsCache = Array.isArray(parsed) ? parsed : [];
      return connectionsCache;
    }
  } catch (error) {
    console.error('Failed to load connections:', error);
  }

  connectionsCache = [];
  return connectionsCache;
}

/**
 * Save connections to localStorage
 */
function saveConnections(connections: Connection[]): void {
  try {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
    connectionsCache = connections;
  } catch (error) {
    console.error('Failed to save connections:', error);
  }
}

/**
 * Create a new connection
 */
export function createConnection(connection: Omit<Connection, 'id' | 'createdAt' | 'updatedAt' | 'scenarios'>): Connection {
  const now = new Date().toISOString();
  const newConnection: Connection = {
    ...connection,
    id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    scenarios: 0,
    createdAt: now,
    updatedAt: now,
  };

  const connections = getConnections();
  connections.push(newConnection);
  saveConnections(connections);

  return newConnection;
}

/**
 * Update an existing connection
 */
export function updateConnection(id: string, updates: Partial<Omit<Connection, 'id' | 'createdAt' | 'scenarios'>>): Connection | null {
  const connections = getConnections();
  const index = connections.findIndex(c => c.id === id);

  if (index === -1) {
    return null;
  }

  connections[index] = {
    ...connections[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveConnections(connections);
  return connections[index];
}

/**
 * Delete a connection
 */
export function deleteConnection(id: string): boolean {
  const connections = getConnections();
  const filtered = connections.filter(c => c.id !== id);

  if (filtered.length === connections.length) {
    return false; // Connection not found
  }

  saveConnections(filtered);
  return true;
}

/**
 * Get connection by ID
 */
export function getConnection(id: string): Connection | null {
  const connections = getConnections();
  return connections.find(c => c.id === id) || null;
}

/**
 * Create Telegram connection from bot info
 */
export function createTelegramConnection(botToken: string, botName: string, botUsername?: string): Connection {
  return createConnection({
    name: `${botName} (@${botUsername || 'bot'})`,
    sub: botUsername || 'bot',
    app: 'Telegram',
    appVersion: '1.0.0',
    lastModified: 'Just now',
    people: ['Current User'], // TODO: Get from auth context
    brand: 'telegram',
    type: 'telegram',
    credentials: {
      token: botToken,
    },
    metadata: {
      botName,
      botUsername,
    },
  });
}

/**
 * Get Telegram connections
 */
export function getTelegramConnections(): Connection[] {
  return getConnections().filter(c => c.type === 'telegram');
}

/**
 * Find Telegram connection by token
 */
export function findTelegramConnectionByToken(token: string): Connection | null {
  return getTelegramConnections().find(c => c.credentials?.token === token) || null;
}

/**
 * Clear all connections (for testing/reset)
 */
export function clearAllConnections(): void {
  localStorage.removeItem(CONNECTIONS_KEY);
  connectionsCache = null;
}
