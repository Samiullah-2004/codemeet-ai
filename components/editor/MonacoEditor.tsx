"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useRef } from "react";

interface MonacoEditorProps {
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
}

export default function MonacoEditor({
  defaultValue = "// Start coding here\n",
  language = "javascript",
  onChange,
}: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="w-full h-[420px] rounded-lg overflow-hidden border border-[var(--color-accent-dim)]">
      <Editor
        height="100%"
        language={language}
        defaultValue={defaultValue}
        theme="vs-dark"
        onMount={handleMount}
        onChange={(value) => onChange?.(value ?? "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}