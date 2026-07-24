// Monaco needs web workers for language features (syntax highlighting,
// IntelliSense). Without this config it falls back to the main thread,
// which works but can cause jank on larger files.
export function configureMonacoWorkers() {
  if (typeof window === "undefined") return;

  (self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
    getWorker(_moduleId: string, label: string) {
      if (label === "json") {
        return new Worker(
          new URL("monaco-editor/esm/vs/language/json/json.worker", import.meta.url)
        );
      }
      if (label === "css" || label === "scss" || label === "less") {
        return new Worker(
          new URL("monaco-editor/esm/vs/language/css/css.worker", import.meta.url)
        );
      }
      if (label === "html") {
        return new Worker(
          new URL("monaco-editor/esm/vs/language/html/html.worker", import.meta.url)
        );
      }
      if (label === "typescript" || label === "javascript") {
        return new Worker(
          new URL("monaco-editor/esm/vs/language/typescript/ts.worker", import.meta.url)
        );
      }
      return new Worker(
        new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url)
      );
    },
  };
}