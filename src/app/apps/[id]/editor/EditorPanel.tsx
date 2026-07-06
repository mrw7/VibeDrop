"use client"

import { useState, useEffect, useCallback } from "react"
import Editor, { loader } from "@monaco-editor/react"
import { Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Configure Monaco to use CDN
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" },
})

interface EditorPanelProps {
  appId: string
  filePath: string | null
  onBackToApp: () => void
}

export default function EditorPanel({ appId, filePath, onBackToApp }: EditorPanelProps) {
  const [content, setContent] = useState<string>("")
  const [originalContent, setOriginalContent] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modifiedFiles, setModifiedFiles] = useState<Record<string, string>>({})
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [language, setLanguage] = useState("plaintext")

  // Detect language from file extension
  useEffect(() => {
    if (!filePath) return
    const ext = filePath.split(".").pop()
    const langMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      css: "css",
      html: "html",
      md: "markdown",
      py: "python",
      rs: "rust",
      go: "go",
      yaml: "yaml",
      yml: "yaml",
    }
    setLanguage(langMap[ext || ""] || "plaintext")
  }, [filePath])

  // Load file content
  useEffect(() => {
    if (!filePath) {
      setContent("")
      setOriginalContent("")
      return
    }

    // Check if we already have a modified version
    if (modifiedFiles[filePath] !== undefined) {
      setContent(modifiedFiles[filePath])
      setOriginalContent(modifiedFiles[filePath])
      return
    }

    async function loadFile() {
      setLoading(true)
      try {
        const res = await fetch(`/api/apps/${appId}/files?path=${encodeURIComponent(filePath!)}`)
        if (!res.ok) throw new Error("Failed to load file")
        const data = await res.json()
        setContent(data.content)
        setOriginalContent(data.content)
      } catch {
        setContent("// Failed to load file")
      } finally {
        setLoading(false)
      }
    }
    loadFile()
  }, [filePath, appId])

  // Track modifications
  const handleChange = useCallback(
    (value: string | undefined) => {
      const newContent = value || ""
      setContent(newContent)
      if (filePath && newContent !== originalContent) {
        setModifiedFiles((prev) => ({ ...prev, [filePath]: newContent }))
      } else if (filePath) {
        setModifiedFiles((prev) => {
          const next = { ...prev }
          delete next[filePath]
          return next
        })
      }
    },
    [filePath, originalContent]
  )

  // Save & Rebuild
  async function handleSave() {
    if (Object.keys(modifiedFiles).length === 0) return

    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch(`/api/apps/${appId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: modifiedFiles }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Save failed")
      }
      const data = await res.json()
      setSaveStatus(`Build queued (${data.filesCount} files). Check app page for status.`)
      setModifiedFiles({})
    } catch (err: unknown) {
      setSaveStatus(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (!filePath) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Select a file to edit</p>
          <p className="text-sm">Choose a file from the tree on the left</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground truncate max-w-[300px]">
            {filePath}
          </span>
          {Object.keys(modifiedFiles).length > 0 && (
            <span className="text-xs text-warning-foreground bg-warning/20 px-2 py-0.5 rounded-full">
              {Object.keys(modifiedFiles).length} modified
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs text-muted-foreground mr-2">{saveStatus}</span>
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || Object.keys(modifiedFiles).length === 0}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Rebuild
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Editor
            theme="vs-dark"
            language={language}
            value={content}
            onChange={handleChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  )
}
