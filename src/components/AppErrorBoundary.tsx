import { Component, type ErrorInfo, type ReactNode } from "react";
import { isDynamicImportChunkError, reloadOnceOnChunkError } from "@/src/lib/lazyRetry";

type BoundaryProps = {
  children?: ReactNode;
};

type BoundaryState = {
  hasError: boolean;
  chunkMiss: boolean;
};

/** Catch render failures so the SPA does not white-screen for public visitors. */
export class AppErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, chunkMiss: false };
  }

  static getDerivedStateFromError(error: Error): BoundaryState {
    const message = error?.message ?? String(error);
    return {
      hasError: true,
      chunkMiss: isDynamicImportChunkError(message),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[AppErrorBoundary]", error.message, info.componentStack);
    // Nested lazy() call sites may miss lazyRetry — recover the same way.
    if (reloadOnceOnChunkError(error.message)) return;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-offgrid-cream px-6 text-center text-offgrid-green">
          <p className="font-display text-2xl font-semibold tracking-tight">Something went wrong</p>
          <p className="mt-2 max-w-md text-sm text-offgrid-green/70">
            {this.state.chunkMiss
              ? "Updating the app… if this stays, refresh once."
              : "Refresh the page to continue. If this keeps happening, contact us from the Contact page."}
          </p>
          <button
            type="button"
            className="mt-6 min-h-11 rounded-full bg-offgrid-green px-6 text-sm font-semibold text-offgrid-cream"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children ?? null;
  }
}
