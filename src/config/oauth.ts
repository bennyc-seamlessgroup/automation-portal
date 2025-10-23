// Configuration for OAuth clients
export const OAUTH_CONFIG = {
  gmail: {
    clientId: import.meta.env.VITE_GMAIL_CLIENT_ID || 'your-gmail-client-id',
    scope: 'https://www.googleapis.com/auth/gmail.readonly'
  }
} as const;
