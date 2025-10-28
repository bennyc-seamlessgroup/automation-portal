import { useEffect } from "react";

interface GmailOAuthResponse {
  code: string;
  scope: string;
  state?: string;
}

interface GmailOAuthErrorResponse {
  error: string;
  error_description?: string;
}

type GmailOAuthCallbackResponse = GmailOAuthResponse | GmailOAuthErrorResponse;

interface GmailButtonProps {
  clientId: string;
  scope: string;
  onSuccess: (response: GmailOAuthResponse) => void;
  onError?: (error: any) => void;
  text?: string;
}

const GmailButton = ({ clientId, scope, onSuccess, onError, text = "Sign in with Google (Gmail)" }: GmailButtonProps) => {
  useEffect(() => {
    let codeClient: any;

    const initializeClient = () => {
      try {
        codeClient = window.google.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: scope,
          callback: (response: GmailOAuthCallbackResponse) => {
            if ('code' in response) {
              // Success response
              onSuccess(response);
            } else if ('error' in response) {
              // Error response
              console.error('Gmail OAuth Error:', response);
              if (onError) {
                onError(response);
              }
            }
          },
        });
      } catch (error) {
        console.error('Failed to initialize Gmail OAuth client:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    if (window.google) {
      initializeClient();
    } else {
      // Wait for Google API to load
      const checkGoogle = () => {
        if (window.google) {
          initializeClient();
        } else {
          // If Google API doesn't load within 10 seconds, show error
          setTimeout(() => {
            if (!window.google && onError) {
              onError(new Error('Google OAuth API not loaded. Please ensure the Google OAuth2 script is included in your HTML.'));
            }
          }, 10000);
        }
      };

      const interval = setInterval(checkGoogle, 100);
      return () => clearInterval(interval);
    }

    const handleClick = () => {
      if (codeClient && codeClient.requestCode) {
        codeClient.requestCode();
      } else {
        console.error('Gmail OAuth client not initialized');
        if (onError) {
          onError(new Error('OAuth client not initialized'));
        }
      }
    };

    const button = document.getElementById("google-login");
    if (button) {
      button.addEventListener("click", handleClick);
      return () => button.removeEventListener("click", handleClick);
    }
  }, [clientId, scope, onSuccess, onError, text]);

  return (
    <button
      id="google-login"
      style={{
        background: "#4285f4",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        padding: "8px 16px",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: "500",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        transition: "background-color 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#3367d6";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#4285f4";
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {text}
    </button>
  );
};

export default GmailButton;
