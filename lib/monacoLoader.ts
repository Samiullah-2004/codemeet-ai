import { loader } from "@monaco-editor/react";

// By default @monaco-editor/react fetches Monaco from a CDN at runtime.
// That's a network dependency that can silently fail. We want to bundle
// Monaco locally instead, but monaco-editor itself references `window`
// at import time, which breaks server-side module evaluation in Next.js.
// So we only load and configure it when actually running in the browser.
export function configureMonacoLoader() {
  if (typeof window === "undefined") return;

  import("monaco-editor").then((monaco) => {
    loader.config({ monaco });
  });
}