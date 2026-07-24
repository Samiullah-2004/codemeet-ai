"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { configureMonacoLoader } from "@/lib/monacoLoader";

configureMonacoLoader();
interface MonacoEditorProps {
  roomId: string;
  defaultValue?: string;
  language?: string;
  onCodeChange?: (code: string) => void;
}

export default function MonacoEditor({
  roomId,
  defaultValue = "// Start coding here\n",
  language = "javascript",
  onCodeChange,
}: MonacoEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const isRemoteChange = useRef(false);

  useEffect(() => {
    const socket = getSocket();

    function handleRemoteChange(code: string) {
      const editor = editorRef.current;
      if (!editor) return;

      // Mark this as a remote update so our own onChange handler
      // doesn't immediately re-broadcast it back out, that would
      // cause an infinite loop between the two tabs.
      isRemoteChange.current = true;
      editor.setValue(code);
    }

    socket.on("code-change", handleRemoteChange);

    return () => {
      socket.off("code-change", handleRemoteChange);
    };
  }, [roomId]);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  function handleChange(value: string | undefined) {
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }
    onCodeChange?.(value ?? "");
    const socket = getSocket();
    socket.emit("code-change", { roomId, code: value ?? "" });
  }

  return (
    <div className="w-full h-[420px] rounded-lg overflow-hidden border border-[var(--color-accent-dim)]">
      <Editor
        height="100%"
        language={language}
        defaultValue={defaultValue}
        theme="vs-dark"
        onMount={handleMount}
        onChange={handleChange}
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