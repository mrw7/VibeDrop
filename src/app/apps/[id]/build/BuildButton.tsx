"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { triggerBuild } from "./actions"
import { Button } from "@/components/ui/button"

export default function BuildButton({ appId, buildStatus }: { appId: string; buildStatus: string }) {
  const [status, setStatus] = useState(buildStatus)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status !== "building" && status !== "pending") return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/apps/${appId}/build-status`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.buildStatus)
          if (data.playUrl) window.location.reload()
        }
      } catch {
        // Polling silently retries
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [status, appId])

  const handleBuild = async () => {
    setLoading(true)
    try {
      await triggerBuild(appId)
      setStatus("pending")
    } catch (error) {
      const message = error instanceof Error ? error.message : "构建触发失败"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getButtonConfig = () => {
    switch (status) {
      case "pending":
        return { text: "等待构建", variant: "secondary" as const, disabled: true }
      case "building":
        return { text: "构建中...", variant: "warning" as const, disabled: true }
      case "success":
        return { text: "重新构建", variant: "outline" as const, disabled: false }
      case "failed":
        return { text: "重新构建", variant: "destructive" as const, disabled: false }
      default:
        return { text: "触发构建", variant: "accent" as const, disabled: false }
    }
  }

  const config = getButtonConfig()

  return (
    <Button
      onClick={handleBuild}
      disabled={loading || config.disabled}
      variant={config.variant as any}
      size="sm"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {loading ? "处理中..." : config.text}
    </Button>
  )
}
