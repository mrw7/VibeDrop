"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Github, Mail, Loader2, ArrowLeft } from "lucide-react"
import { signIn as nextAuthSignIn } from "next-auth/react"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInWithPassword } from "../actions"

type Tab = "github" | "email"

function SignInToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const verified = searchParams.get("verified")
    const reset = searchParams.get("reset")

    if (verified === "success") {
      toast.success("邮箱验证成功！请登录")
    }
    if (reset === "success") {
      toast.success("密码重置成功！请用新密码登录")
    }
  }, [searchParams])

  return null
}

export default function SignInPage() {
  const [tab, setTab] = useState<Tab>("github")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGitHubSignIn() {
    setLoading(true)
    try {
      await nextAuthSignIn("github", { redirectTo: "/" })
    } catch {
      setLoading(false)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      await signInWithPassword(formData)
      // Redirect happens in the server action
    } catch (error) {
      const message = error instanceof Error ? error.message : "登录失败"
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* 装饰:渐变光斑 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 glow-brand pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 glow-brand pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />

      <Suspense fallback={null}>
        <SignInToast />
      </Suspense>
      <div className="relative bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up shadow-soft">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground mt-2">
            登录以分享和发现 Vibe Coding 作品
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border border-border rounded-lg mb-6 overflow-hidden">
          <button
            onClick={() => setTab("github")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "github"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
          <button
            onClick={() => setTab("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
              tab === "email"
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <Mail className="w-4 h-4" />
            邮箱
          </button>
        </div>

        {/* GitHub Panel */}
        {tab === "github" && (
          <div className="space-y-4">
            <Button
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Github className="w-5 h-5" />
              )}
              使用 GitHub 登录
            </Button>
          </div>
        )}

        {/* Email Panel */}
        {tab === "email" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">邮箱</Label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="signin-password">密码</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-xs text-muted-foreground hover:text-accent transition-colors"
                >
                  忘记密码？
                </Link>
              </div>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              登录
            </Button>
          </form>
        )}

        <p className="text-sm text-muted-foreground text-center mt-6">
          还没有账号？{" "}
          <Link
            href="/auth/signup"
            className="text-accent hover:underline font-medium"
          >
            立即注册
          </Link>
        </p>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
