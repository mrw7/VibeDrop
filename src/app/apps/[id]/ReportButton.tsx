"use client"

import { useState } from "react"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"
import { reportApp } from "./actions"
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

export default function ReportButton({ appId }: { appId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    setLoading(true)
    try {
      await reportApp(appId, reason)
      setSubmitted(true)
      setTimeout(() => {
        setOpen(false)
        setSubmitted(false)
        setReason("")
      }, 2000)
    } catch (error) {
      const message = error instanceof Error ? error.message : "举报失败"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <AlertTriangle className="w-4 h-4" />
        举报
      </Button>

      <DialogContent>
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>举报作品</DialogTitle>
              <DialogDescription>
                请描述举报原因，我们会尽快处理
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请描述举报原因..."
                rows={4}
                className="mb-4"
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button type="submit" variant="destructive" disabled={loading || !reason.trim()}>
                  {loading ? "提交中..." : "提交举报"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-success text-4xl mb-2">✓</div>
            <p className="text-muted-foreground">举报已提交，感谢你的反馈</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
