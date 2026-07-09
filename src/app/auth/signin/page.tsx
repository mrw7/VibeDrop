"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Github, Loader2, ArrowLeft } from "lucide-react"
import { signIn as nextAuthSignIn } from "next-auth/react"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"

function SignInToast() {
  const searchParams = useSearchParams()

  if (typeof window === "undefined") return null
  const verified = searchParams.get("verified")
  const reset = searchParams.get("reset")

  if (verified === "success") {
    toast.success("邮箱验证成功！请登录")
  }
  if (reset === "success") {
    toast.success("密码重置成功！请用新密码登录")
  }

  return null
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  async function handleGitHubSignIn() {
    setLoading(true)
    try {
      await nextAuthSignIn("github", { redirectTo: "/" })
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden scanlines">
      <div className="absolute inset-0 bg-pixel-grid pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] glow-neon-radial pointer-events-none" aria-hidden="true" />

      <Suspense fallback={null}>
        <SignInToast />
      </Suspense>

      <div className="relative z-10 bg-card/90 backdrop-blur-sm border-2 border-border p-8 rounded-none max-w-md w-full mx-4 animate-fade-in-up pixel-shadow">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground mt-2">
            使用 GitHub 登录 VibeDrop
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            disabled={loading}
            className="w-full font-pixel"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Github className="w-5 h-5" />
            )}
            SIGN IN WITH GITHUB
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
