"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps one misbehaving subtree from taking the page down with it. React only
 * offers this as a class component — there is no hook equivalent.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; label?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[${this.props.label ?? "ErrorBoundary"}]`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
