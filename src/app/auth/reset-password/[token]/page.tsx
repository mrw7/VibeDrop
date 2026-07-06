"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Key, Loader2, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "../../actions"

export default function NewPasswordPage() {
  const params = useParams()
  const token = params.token as string
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

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
      formData.append("token", token)
      formData.append("password", password)
      await resetPassword(formData)
      // Redirect happens in the server action
    } catch (error) {
      const message = error instanceof Error ? error.message : "重置失败"
      toast.error(message)
      setLoading(false)
    }
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
          <p className="text-muted-foreground mt-2">设置新密码</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <div className="relative">
              <Input
                id="new-password"
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
            <Label htmlFor="confirm-new-password">确认新密码</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
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
              <Key className="w-5 h-5" />
            )}
            重置密码
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  )
}
