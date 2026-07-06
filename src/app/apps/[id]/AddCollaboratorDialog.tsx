"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UserPlus, X, Search } from "lucide-react"
import Image from "next/image"
import { addCollaborator, removeCollaborator } from "./collaborators/actions"
import { getUserDisplayName, getUserAvatarUrl } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SearchResult {
  id: string
  name: string | null
  githubLogin: string | null
  avatarUrl: string | null
}

interface AddCollaboratorDialogProps {
  appId: string
  existingUserIds: string[]
}

export default function AddCollaboratorDialog({
  appId,
  existingUserIds,
}: AddCollaboratorDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length < 2) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(
            (data.users as SearchResult[]).filter(
              (u) => !existingUserIds.includes(u.id)
            )
          )
        } else {
          setResults([])
        }
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, existingUserIds])

  const handleAdd = async (userId: string) => {
    setAdding(userId)
    try {
      await addCollaborator(appId, userId)
      toast.success("协作者已添加")
      router.refresh()
      // Remove this user from results
      setResults((prev) => prev.filter((u) => u.id !== userId))
      setQuery("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "添加失败"
      toast.error(message)
    } finally {
      setAdding(null)
    }
  }

  const handleRemove = async (userId: string) => {
    setRemoving(userId)
    try {
      await removeCollaborator(appId, userId)
      toast.success("协作者已移除")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "移除失败"
      toast.error(message)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4" />
        管理协作者
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>管理协作者</DialogTitle>
          <DialogDescription>
            搜索用户并添加为协作者，他们将能够编辑代码和触发构建
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户名..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search results */}
          {query.length >= 2 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searching ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  搜索中...
                </p>
              ) : results.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  未找到匹配的用户
                </p>
              ) : (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={getUserAvatarUrl(user)}
                        alt={getUserDisplayName(user)}
                        width={32}
                        height={32}
                        className="rounded-full ring-1 ring-border"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {getUserDisplayName(user)}
                        </p>
                        {user.githubLogin && (
                          <p className="text-xs text-muted-foreground">
                            @{user.githubLogin}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="accent"
                      onClick={() => handleAdd(user.id)}
                      disabled={adding === user.id}
                    >
                      {adding === user.id ? "添加中..." : "添加"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Existing collaborators managed here too */}
          {existingUserIds.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                当前协作者 ({existingUserIds.length})
              </p>
              <p className="text-xs text-muted-foreground">
                在下方作品页面的协作者列表中可看到详情并移除
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
