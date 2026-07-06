"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordReset } from "../actions"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("请输入有效的邮箱地址")
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("email", email)
      await requestPasswordReset(formData)
      setSent(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : "发送失败"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">重置链接已发送</h1>
          <p className="text-muted-foreground mb-6">
            如果 <span className="font-medium text-foreground">{email}</span> 已注册 VibeDrop，你将收到一封包含重置密码链接的邮件。
          </p>
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回登录
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-3xl font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity"
          >
            VibeDrop
          </Link>
          <p className="text-muted-foreground mt-2">重置你的密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">邮箱</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              输入注册时使用的邮箱，我们将发送重置链接
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            发送重置链接
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
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
