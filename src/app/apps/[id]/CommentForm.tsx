"use client"

import { useState } from "react"
import { toast } from "sonner"
import { addComment } from "./actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquarePlus } from "lucide-react"

export default function CommentForm({ appId }: { appId: string }) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      await addComment(appId, content)
      setContent("")
      toast.success("评论发表成功")
    } catch (error) {
      const message = error instanceof Error ? error.message : "评论失败，请重试"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={3}
      />
      <Button type="submit" disabled={loading || !content.trim()} variant="accent" size="sm">
        <MessageSquarePlus className="w-4 h-4" />
        {loading ? "发送中..." : "发表评论"}
      </Button>
    </form>
  )
}
