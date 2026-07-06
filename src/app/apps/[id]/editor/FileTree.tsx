"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react"

interface TreeNode {
  name: string
  type: "file" | "dir"
  size?: number
  children?: TreeNode[]
}

interface FileTreeProps {
  appId: string
  onSelectFile: (path: string) => void
  selectedPath: string | null
}

function TreeNodeItem({
  node,
  depth,
  path,
  onSelectFile,
  selectedPath,
}: {
  node: TreeNode
  depth: number
  path: string
  onSelectFile: (path: string) => void
  selectedPath: string | null
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const fullPath = path ? `${path}/${node.name}` : node.name

  if (node.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full px-2 py-1 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          )}
          {expanded ? (
            <FolderOpen className="w-4 h-4 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded &&
          node.children?.map((child) => (
            <TreeNodeItem
              key={fullPath + "/" + child.name}
              node={child}
              depth={depth + 1}
              path={fullPath}
              onSelectFile={onSelectFile}
              selectedPath={selectedPath}
            />
          ))}
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelectFile(fullPath)}
      className={`flex items-center gap-1 w-full px-2 py-1 text-left text-sm rounded transition-colors ${
        selectedPath === fullPath
          ? "bg-accent/20 text-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      }`}
      style={{ paddingLeft: `${depth * 16 + 28}px` }}
    >
      <File className="w-4 h-4 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

export default function FileTree({ appId, onSelectFile, selectedPath }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTree() {
      try {
        const res = await fetch(`/api/apps/${appId}/files`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || "Failed to load files")
        }
        const data = await res.json()
        setTree(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load files")
      } finally {
        setLoading(false)
      }
    }
    loadTree()
  }, [appId])

  if (loading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-6 bg-muted rounded animate-pulse"
            style={{ width: `${60 + Math.random() * 30}%`, marginLeft: `${(i % 3) * 12}px` }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        <p>Failed to load files</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="py-2 overflow-y-auto h-full">
      {tree.map((node) => (
        <TreeNodeItem
          key={node.name}
          node={node}
          depth={0}
          path=""
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </div>
  )
}
