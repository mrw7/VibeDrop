"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal static header — error boundaries must stay client-safe,
          so we cannot import the server-component Header here. */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
          >
            VibeDrop
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">出了点问题</h1>
          <p className="text-muted-foreground mb-8">页面加载时遇到了错误，请尝试重试</p>
          <Button onClick={reset}>
            <RefreshCw className="w-4 h-4" />
            重试
          </Button>
        </div>
      </main>
    </div>
  )
}
