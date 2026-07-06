"use client"

import { useState, useEffect, useRef } from "react"

interface BuildLogPanelProps {
  appId: string
  buildStatus: string
}

export default function BuildLogPanel({ appId, buildStatus }: BuildLogPanelProps) {
  const [expanded, setExpanded] = useState(buildStatus === "failed")
  const [buildLog, setBuildLog] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  // Fetch build log when expanded
  useEffect(() => {
    if (!expanded) return

    const fetchLog = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/apps/${appId}/build-status`)
        if (res.ok) {
          const data = await res.json()
          setBuildLog(data.latestBuild?.buildLog || null)
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setLoading(false)
      }
    }

    fetchLog()

    // Poll while building
    if (buildStatus === "building" || buildStatus === "pending") {
      const interval = setInterval(fetchLog, 5000)
      return () => clearInterval(interval)
    }
  }, [expanded, appId, buildStatus])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (expanded && buildLog) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [buildLog, expanded])

  const toggle = () => setExpanded((prev) => !prev)

  return (
    <div className="mt-4 w-full max-w-[320px]">
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          {buildStatus === "building"
            ? "构建日志（实时更新..."
            : buildStatus === "failed"
            ? "构建日志（构建失败）"
            : "构建日志"}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-4">
            {loading && !buildLog ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full" />
              </div>
            ) : buildLog ? (
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all leading-relaxed">
                {buildLog}
                <div ref={logEndRef} />
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无构建日志
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
