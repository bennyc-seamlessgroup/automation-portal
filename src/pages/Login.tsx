import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    return (
      <div
        style={{
          background: "var(--ws-bg)",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          padding: "16px",
        }}
      >
        <div
          className="shadow-lg border-0 text-center"
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "2.5rem",
            borderRadius: "1rem",
            background: "linear-gradient(135deg, #0b1220 0%, #0f1a2b 100%)", // dark blue center
            color: "#e9eefc",
            transform: "translateY(-4vh)",
          }}
        >
          {/* Logo + title */}
          <div className="mb-4">
            <div
              style={{
                fontSize: "2rem",
                marginBottom: "0.5rem",
                color: "#7ab8ff",
              }}
            >
              ⚙️
            </div>
            <h2 className="fw-bold mb-1">Automation Portal</h2>
            <p className="text-secondary m-0">Sign in to build your automations</p>
          </div>
  
          {/* SSO buttons only */}
          <div className="d-grid gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn btn-light d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-google"></i> Continue with Google
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-light d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-microsoft"></i> Continue with Microsoft
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn btn-light d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-apple"></i> Continue with Apple
            </button>
          </div>
  
          {/* Terms */}
          <p className="text-center small mt-4 mb-0" style={{ color: "#b0b8c8" }}>
            By continuing, you agree to our{" "}
            <a href="#" className="link-light text-decoration-none">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="link-light text-decoration-none">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
  