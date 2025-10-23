// Type declarations for Google OAuth2 API
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => any;
        };
      };
    };
  }
}

export {};
