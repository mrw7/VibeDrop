"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Loader2, XCircle, ArrowLeft, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resendVerificationEmail } from "../actions"

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email") || ""
  const codeParam = searchParams.get("code") // dev mode: code passed directly in URL
  const [code, setCode] = useState(codeParam || "")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [verified, setVerified] = useState(false)

  async function handleVerify() {
    if (!code || code.length < 6) {
      toast.error("请输入 6 位验证码")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "验证失败")
      } else {
        setVerified(true)
        toast.success("邮箱验证成功！")
        setTimeout(() => router.push("/auth/signin?verified=success"), 1500)
      }
    } catch {
      toast.error("验证失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      await resendVerificationEmail(formData)
      toast.success("验证码已重新发送")
    } catch {
      toast.error("发送失败，请稍后重试")
    } finally {
      setResending(false)
    }
  }

  // Show dev code on page if provided via URL param (dev mode without SMTP)
  const devCode = codeParam || ""
  const showDevCode = devCode && process.env.NODE_ENV !== "production"

  if (verified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">验证成功</h1>
          <p className="text-muted-foreground mb-6">即将跳转到登录页...</p>
          <Button onClick={() => router.push("/auth/signin?verified=success")}>
            去登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <Mail className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">验证你的邮箱</h1>
          <p className="text-muted-foreground mb-2">
            我们已向{" "}
            <span className="font-medium text-foreground">{email || "你的邮箱"}</span>{" "}
            发送了一封验证邮件。
          </p>
          <p className="text-sm text-muted-foreground">
            请输入邮件中的 6 位验证码。有效期为 10 分钟。
          </p>
        </div>

        {showDevCode && (
          <div className="mb-4 p-3 rounded-lg bg-muted border border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">[DEV MODE] 验证码:</p>
            <p className="text-2xl font-mono font-bold neon-text-pink">{devCode}</p>
          </div>
        )}

        {/* Code input */}
        <div className="space-y-4 mb-6">
          <div>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="输入 6 位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl font-mono tracking-[0.5em] h-14"
              onKeyDown={(e) => { if (e.key === "Enter") handleVerify() }}
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={loading || code.length < 6}
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            验证邮箱
          </Button>
        </div>

        {/* Resend */}
        <div className="text-center mb-4">
          <button
            onClick={handleResend}
            disabled={resending || !email}
            className="text-sm text-muted-foreground hover:text-accent transition-colors disabled:opacity-50"
          >
            {resending ? "发送中..." : "重新发送验证码"}
          </button>
        </div>

        <div className="pt-4 border-t border-border">
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
