"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FileTree from "./FileTree"
import EditorPanel from "./EditorPanel"

export default function EditorShell({ appId }: { appId: string }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const router = useRouter()

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-60 lg:w-72 border-r border-border bg-card overflow-hidden flex-shrink-0">
        <div className="px-3 py-2 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Files
        </div>
        <FileTree
          appId={appId}
          onSelectFile={setSelectedFile}
          selectedPath={selectedFile}
        />
      </div>

      {/* Editor Area */}
      <EditorPanel
        appId={appId}
        filePath={selectedFile}
        onBackToApp={() => router.push(`/apps/${appId}`)}
      />
    </div>
  )
}
