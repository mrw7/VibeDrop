"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Loader2, CheckCircle, XCircle, ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { resendVerificationEmail } from "../actions"

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const error = searchParams.get("error")
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (error === "expired") {
      toast.error("验证链接已过期，请重新发送")
    } else if (error === "missing-token") {
      toast.error("无效的验证链接")
    }
  }, [error])

  async function handleResend() {
    if (!email) return
    setResending(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      await resendVerificationEmail(formData)
      toast.success("验证邮件已重新发送")
    } catch {
      toast.error("发送失败，请稍后重试")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up text-center">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">验证失败</h1>
            <p className="text-muted-foreground mb-6">
              {error === "expired"
                ? "验证链接已过期（超过 24 小时），请重新发送验证邮件。"
                : "验证链接无效，请检查链接是否完整。"}
            </p>
            {email && (
              <Button onClick={handleResend} disabled={resending} className="w-full">
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                重新发送验证邮件
              </Button>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">验证你的邮箱</h1>
            <p className="text-muted-foreground mb-2">
              我们已向{" "}
              <span className="font-medium text-foreground">{email || "你的邮箱"}</span>{" "}
              发送了一封验证邮件。
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              请点击邮件中的链接完成注册。链接 24 小时内有效。
            </p>
            {email && (
              <Button onClick={handleResend} disabled={resending} variant="outline" className="w-full">
                {resending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                重新发送验证邮件
              </Button>
            )}
          </>
        )}

        <div className="mt-6 pt-4 border-t border-border space-y-2">
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
