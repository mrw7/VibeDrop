"use client"

import { useState } from "react"
import { toast } from "sonner"
import { deleteComment } from "./actions"

interface CommentDeleteButtonProps {
  commentId: string
  canDelete: boolean
}

export default function CommentDeleteButton({
  commentId,
  canDelete,
}: CommentDeleteButtonProps) {
  const [loading, setLoading] = useState(false)

  if (!canDelete) return null

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteComment(commentId)
      toast.success("评论已删除")
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-2"
      aria-label="删除评论"
    >
      {loading ? "..." : "删除"}
    </button>
  )
}
