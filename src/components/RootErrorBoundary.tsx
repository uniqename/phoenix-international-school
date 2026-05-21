"use client";
import React from "react";

interface State {
  error?: Error;
}

// Window-level catch-all so non-React errors (e.g. async failures in service
// worker registration, Capacitor plugin loads) also surface visibly instead
// of getting swallowed.
let globalErrorHandlerInstalled = false;
function installGlobalErrorHandler(onError: (err: Error) => void) {
  if (globalErrorHandlerInstalled || typeof window === "undefined") return;
  globalErrorHandlerInstalled = true;
  window.addEventListener("error", (e) => {
    if (e.error instanceof Error) onError(e.error);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason = (e as PromiseRejectionEvent).reason;
    if (reason instanceof Error) onError(reason);
  });
}

// Catches uncaught errors during render anywhere in the tree. Replaces the
// "stuck on bouncing logo" failure mode with a visible, copyable error so we
// can actually diagnose iOS WebView issues from a TestFlight build.
export default class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = {};

  componentDidMount() {
    installGlobalErrorHandler((err) => {
      if (!this.state.error) this.setState({ error: err });
    });
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Logged for the iOS console / Safari Web Inspector.
    // eslint-disable-next-line no-console
    console.error("Phoenix app crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const msg = this.state.error.message || String(this.state.error);
      return (
        <div style={{
          minHeight: "100vh",
          background: "#0C0A1E",
          color: "#fff",
          padding: "32px 20px",
          fontFamily: "system-ui, sans-serif",
        }}>
          <h1 style={{ color: "#FFD700", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            🐛 Something went wrong
          </h1>
          <p style={{ color: "rgba(196,181,253,0.85)", fontSize: 14, marginBottom: 16 }}>
            The app hit an error during startup. Please copy the message below and send it to your school admin so we can fix it.
          </p>
          <pre style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 12,
            padding: 16,
            fontSize: 12,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            color: "#fca5a5",
          }}>
            {msg}
          </pre>
          <button
            type="button"
            onClick={() => { try { window.location.reload(); } catch { /* noop */ } }}
            style={{
              marginTop: 16,
              background: "linear-gradient(135deg,#d4af37,#f4d76e)",
              color: "#1A0E4D",
              padding: "10px 18px",
              borderRadius: 12,
              fontWeight: 800,
              border: "none",
            }}
          >
            🔁 Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
