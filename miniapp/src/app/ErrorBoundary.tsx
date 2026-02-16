import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error);
    console.error("Component stack:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
          <h2 style={{ margin: "0 0 10px 0" }}>Ошибка в приложении</h2>
          <p style={{ opacity: 0.8, marginTop: 0 }}>Открой DevTools → Console, там будет стек.</p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "rgba(0,0,0,.25)",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.12)",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
