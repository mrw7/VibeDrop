"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GitFork } from "lucide-react"
import { Button } from "@/components/ui/button"
import { forkApp } from "./actions"

interface ForkButtonProps {
  appId: string
  forksCount: number
}

export default function ForkButton({ appId, forksCount }: ForkButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleFork() {
    setLoading(true)
    try {
      const result = await forkApp(appId)
      if (result && "forkedId" in result) {
        router.push(`/apps/${result.forkedId}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Fork 失败"
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFork}
      disabled={loading}
      className="gap-2"
    >
      <GitFork className="w-4 h-4" />
      {loading ? "Fork 中..." : `Fork (${forksCount})`}
    </Button>
  )
}
