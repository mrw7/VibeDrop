"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signUp } from "../actions"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!name || name.length < 2) {
      newErrors.name = "显示名称至少 2 个字符"
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "请输入有效的邮箱地址"
    }

    if (!password || password.length < 8) {
      newErrors.password = "密码至少 8 个字符"
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "密码需包含大写字母"
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "密码需包含小写字母"
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "密码需包含数字"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "两次输入的密码不一致"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("password", password)
      await signUp(formData)
      // Redirect happens in the server action
    } catch (error) {
      const message = error instanceof Error ? error.message : "注册失败"
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 glow-brand pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 glow-brand pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />
      <div className="relative bg-card/80 backdrop-blur-sm border border-border p-8 rounded-2xl max-w-md w-full mx-4 animate-fade-in-up shadow-soft">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground mt-2">创建你的 VibeDrop 账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">显示名称</Label>
            <Input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字"
              required
              autoComplete="name"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">邮箱</Label>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">密码</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 位，含大小写字母和数字"
                required
                autoComplete="new-password"
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm">确认密码</Label>
            <Input
              id="signup-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              required
              autoComplete="new-password"
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mail className="w-5 h-5" />
            )}
            注册
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          已有账号？{" "}
          <Link
            href="/auth/signin"
            className="text-accent hover:underline font-medium"
          >
            登录
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
