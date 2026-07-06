"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, Loader2, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { rollbackApp } from "./actions"

interface BuildRecord {
  id: string
  status: string
  buildLog: string | null
  artifactUrl: string | null
  startedAt: Date
  completedAt: Date | null
}

interface BuildHistoryProps {
  builds: BuildRecord[]
  currentBuildId: string | null
  canEdit: boolean
  appId: string
}

function statusIcon(status: string) {
  switch (status) {
    case "success":
      return <CheckCircle className="w-4 h-4 text-success" />
    case "failed":
      return <XCircle className="w-4 h-4 text-destructive" />
    case "building":
      return <Loader2 className="w-4 h-4 text-warning-foreground animate-spin" />
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "success":
      return "构建成功"
    case "failed":
      return "构建失败"
    case "building":
      return "构建中"
    default:
      return "等待中"
  }
}

function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "warning" {
  switch (status) {
    case "success":
      return "default"
    case "failed":
      return "destructive"
    case "building":
    case "pending":
      return "warning"
    default:
      return "secondary"
  }
}

export default function BuildHistory({ builds, currentBuildId, canEdit, appId }: BuildHistoryProps) {
  const [expanded, setExpanded] = useState(false)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [rollingBack, setRollingBack] = useState<string | null>(null)

  if (builds.length === 0) return null

  async function handleRollback(buildId: string) {
    setRollingBack(buildId)
    try {
      await rollbackApp(appId, buildId)
    } catch {
      // Error is surfaced via sonner toast by the rollbackApp action (AppError)
    } finally {
      setRollingBack(null)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <h3 className="text-lg font-semibold text-foreground">
          构建历史
        </h3>
        <Badge variant="secondary" className="ml-auto">
          {builds.length} 次
        </Badge>
      </button>

      {expanded && (
        <div className="mt-4 space-y-0">
          {builds.map((build, idx) => {
            const isLatest = idx === 0
            const isCurrent = build.id === currentBuildId
            const showConnector = idx < builds.length - 1

            return (
              <div key={build.id} className="relative flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="mt-1.5">{statusIcon(build.status)}</div>
                  {showConnector && (
                    <div className="w-px flex-1 bg-border mt-1 mb-1" />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-3 ${showConnector ? "" : ""}`}>
                  <div
                    className={`rounded-lg border p-3 ${
                      isCurrent
                        ? "border-accent/50 bg-accent/5"
                        : "border-border bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(build.startedAt).toLocaleString("zh-CN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <Badge variant={statusBadgeVariant(build.status)}>
                        {statusLabel(build.status)}
                      </Badge>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          当前版本
                        </Badge>
                      )}
                      {isLatest && !isCurrent && (
                        <span className="text-xs text-muted-foreground">
                          (更新于其他构建)
                        </span>
                      )}
                    </div>

                    {/* Build duration */}
                    {build.completedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        耗时:{" "}
                        {Math.round(
                          (new Date(build.completedAt).getTime() -
                            new Date(build.startedAt).getTime()) /
                            1000
                        )}
                        秒
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-2">
                      {build.buildLog && (
                        <button
                          onClick={() =>
                            setExpandedLog(
                              expandedLog === build.id ? null : build.id
                            )
                          }
                          className="text-xs text-accent hover:underline"
                        >
                          {expandedLog === build.id ? "收起日志" : "查看日志"}
                        </button>
                      )}
                      {canEdit &&
                        build.status === "success" &&
                        !isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(build.id)}
                            disabled={rollingBack === build.id}
                            className="text-xs h-7"
                          >
                            <RotateCcw className="w-3 h-3" />
                            {rollingBack === build.id ? "回滚中..." : "回滚到此版本"}
                          </Button>
                        )}
                    </div>

                    {/* Expanded Log */}
                    {expandedLog === build.id && build.buildLog && (
                      <pre className="mt-2 p-3 bg-background rounded-md text-xs font-mono text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {build.buildLog}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
