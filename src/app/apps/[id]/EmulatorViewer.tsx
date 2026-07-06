"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Loader2, AlertTriangle, Smartphone, StopCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmulatorViewerProps {
  appId: string
}

type SessionState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "running" }
  | { phase: "installing" }
  | { phase: "ready"; sessionId: string; streamUrl: string }
  | { phase: "error"; message: string }

export default function EmulatorViewer({ appId }: EmulatorViewerProps) {
  const [state, setState] = useState<SessionState>({ phase: "idle" })
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const startEmulator = async () => {
    setState({ phase: "starting" })

    try {
      const res = await fetch("/api/emulator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setState({
          phase: "error",
          message: data.error || "启动模拟器失败",
        })
        return
      }

      const { sessionId, streamUrl } = await res.json()

      // Start polling for status
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/emulator/${sessionId}`)
          if (!statusRes.ok) return

          const session = await statusRes.json()
          const status = session.status as string

          if (status === "ready") {
            cleanup()
            setState({
              phase: "ready",
              sessionId,
              streamUrl: session.streamUrl || streamUrl,
            })
          } else if (status === "installing") {
            setState({ phase: "installing" })
          } else if (status === "running") {
            setState({ phase: "running" })
          } else if (status === "error" || status === "stopped") {
            cleanup()
            setState({
              phase: "error",
              message: session.error || "模拟器运行异常",
            })
          }
        } catch {
          // Polling error — ignore
        }
      }, 2000)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "启动模拟器失败"
      setState({ phase: "error", message })
    }
  }

  const stopEmulator = async (sessionId: string) => {
    cleanup()
    setState({ phase: "idle" })

    try {
      await fetch(`/api/emulator/${sessionId}/stop`, { method: "POST" })
    } catch {
      // Best effort
    }
  }

  // Idle state: start button
  if (state.phase === "idle") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 mb-4 rounded-full bg-accent/20 flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-accent" />
        </div>
        <p className="text-foreground font-medium mb-2">原生模拟器</p>
        <p className="text-muted-foreground text-sm text-center mb-4">
          在云端 Android 模拟器中运行此应用
        </p>
        <Button onClick={startEmulator} variant="accent" size="sm">
          <Play className="w-4 h-4" />
          启动模拟器
        </Button>
      </div>
    )
  }

  // Loading states
  if (
    state.phase === "starting" ||
    state.phase === "running" ||
    state.phase === "installing"
  ) {
    const label =
      state.phase === "installing"
        ? "正在安装应用..."
        : state.phase === "running"
          ? "模拟器已启动，正在准备..."
          : "正在启动模拟器..."

    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 mb-4 rounded-full bg-warning/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-warning-foreground animate-spin" />
        </div>
        <p className="text-foreground font-medium mb-2">{label}</p>
        <p className="text-muted-foreground text-sm text-center">
          首次启动约需 30-60 秒
        </p>
      </div>
    )
  }

  // Ready state: stream the emulator
  if (state.phase === "ready") {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Stream iframe */}
        <iframe
          src={state.streamUrl}
          className="flex-1 border-0"
          title="Android Emulator"
          allow="clipboard-read; clipboard-write"
        />

        {/* Control bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border">
          <span className="text-xs text-success flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            模拟器运行中
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => stopEmulator(state.sessionId)}
            className="text-destructive hover:text-destructive"
          >
            <StopCircle className="w-4 h-4" />
            停止
          </Button>
        </div>
      </div>
    )
  }

  // Error state
  if (state.phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="w-16 h-16 mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-foreground font-medium mb-2">模拟器启动失败</p>
        <p className="text-muted-foreground text-sm text-center mb-4">
          {state.message}
        </p>
        <Button onClick={() => setState({ phase: "idle" })} variant="outline" size="sm">
          重试
        </Button>
      </div>
    )
  }

  return null
}
