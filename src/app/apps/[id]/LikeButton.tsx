"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { likeApp, unlikeApp } from "./actions"
import { Button } from "@/components/ui/button"
import { useAction } from "@/lib/use-action"

export default function LikeButton({
  appId,
  likesCount,
  hasLiked,
}: {
  appId: string
  likesCount: number
  hasLiked: boolean
}) {
  const [liked, setLiked] = useState(hasLiked)
  const [count, setCount] = useState(likesCount)

  const { execute: handleToggle, loading } = useAction(
    async () => {
      if (liked) {
        await unlikeApp(appId)
        setCount((prev) => prev - 1)
      } else {
        await likeApp(appId)
        setCount((prev) => prev + 1)
      }
      setLiked(!liked)
    },
    {
      onSuccess: () => {
        // Optimistic update already applied
      },
    }
  )

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={liked ? "destructive" : "ghost"}
      size="sm"
      aria-label={liked ? "取消点赞" : "点赞"}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      {count}
    </Button>
  )
}
