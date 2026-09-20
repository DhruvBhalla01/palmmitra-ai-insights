import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Route rendering failed", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6" role="alert">
        <div className="w-full max-w-md rounded-3xl border border-accent/20 bg-card/80 p-8 text-center shadow-premium">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">This page needs a refresh</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            PalmMitra could not finish loading this experience. Your saved reading data is safe.
          </p>
          <Button type="button" onClick={this.handleRetry} className="btn-gold mt-6 text-foreground">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      </main>
    );
  }
}
