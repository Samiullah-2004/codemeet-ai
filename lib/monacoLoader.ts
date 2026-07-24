import { loader } from "@monaco-editor/react";
import { configureMonacoWorkers } from "./monacoEnvironment";

export function configureMonacoLoader() {
  if (typeof window === "undefined") return;

  configureMonacoWorkers();

  import("monaco-editor").then((monaco) => {
    loader.config({ monaco });
  });
}