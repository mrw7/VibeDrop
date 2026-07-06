"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TIP_PRESETS } from "@/lib/stripe"
import { createCheckoutSession } from "./tips/actions"

interface TipButtonProps {
  appId: string
  tipsCount: number
}

export default function TipButton({ appId, tipsCount }: TipButtonProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleTip() {
    if (amount <= 0) return

    setLoading(true)
    try {
      const result = await createCheckoutSession(appId, amount, message || undefined)
      if (result && "url" in result && result.url) {
        window.location.href = result.url
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "操作失败"
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <Heart className="w-4 h-4" />
        打赏{tipsCount > 0 ? ` (${tipsCount})` : ""}
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>打赏创作者</DialogTitle>
          <DialogDescription>
            选择一个金额，向创作者表达你的支持
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {TIP_PRESETS.map((preset) => (
              <button
                key={preset.amount}
                onClick={() => setAmount(preset.amount)}
                className={`py-3 rounded-lg text-sm font-medium transition-colors border ${
                  amount === preset.amount
                    ? "bg-accent text-white border-accent"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-muted"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Optional message */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              留言（可选）
            </p>
            <Textarea
              placeholder="给创作者留言..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button
            onClick={handleTip}
            disabled={loading || amount <= 0}
            variant="accent"
          >
            {loading ? "跳转中..." : amount > 0 ? `打赏 ¥${(amount / 100).toFixed(2)}` : "选择金额"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
