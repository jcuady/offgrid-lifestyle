import { Component, type ErrorInfo, type ReactNode } from "react";

type BoundaryProps = {
  children?: ReactNode;
};

type BoundaryState = {
  hasError: boolean;
};

/** Catch render failures so the SPA does not white-screen for public visitors. */
export class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[AppErrorBoundary]", error.message, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-offgrid-cream px-6 text-center text-offgrid-green">
          <p className="font-display text-2xl font-semibold tracking-tight">Something went wrong</p>
          <p className="mt-2 max-w-md text-sm text-offgrid-green/70">
            Refresh the page to continue. If this keeps happening, contact us from the Contact page.
          </p>
          <button
            type="button"
            className="mt-6 min-h-11 rounded-full bg-offgrid-green px-6 text-sm font-semibold text-offgrid-cream"
            onClick={() => window.location.assign("/")}
          >
            Back to home
          </button>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
