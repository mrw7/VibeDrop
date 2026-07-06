"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil } from "lucide-react"
import { editApp } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditAppButtonProps {
  appId: string
  initialTitle: string
  initialDescription: string
  initialAiToolTag: string | null
  initialTechStackTag: string | null
  initialDeviceType: string
}

export default function EditAppButton({
  appId,
  initialTitle,
  initialDescription,
  initialAiToolTag,
  initialTechStackTag,
  initialDeviceType,
}: EditAppButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [aiToolTag, setAiToolTag] = useState(initialAiToolTag || "")
  const [techStackTag, setTechStackTag] = useState(initialTechStackTag || "")
  const [deviceType, setDeviceType] = useState(initialDeviceType)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await editApp(appId, {
        title,
        description,
        aiToolTag: aiToolTag || undefined,
        techStackTag: techStackTag || undefined,
        deviceType,
      })
      setOpen(false)
      toast.success("修改已保存")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存失败"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="w-4 h-4" />
        编辑
      </Button>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>编辑作品</DialogTitle>
          <DialogDescription>修改作品信息后保存</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/20 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-title">
              标题 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">描述</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ai">AI 工具</Label>
              <select
                id="edit-ai"
                value={aiToolTag}
                onChange={(e) => setAiToolTag(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                <option value="">选择工具</option>
                <option value="Cursor">Cursor</option>
                <option value="v0">v0</option>
                <option value="Bolt">Bolt</option>
                <option value="Lovable">Lovable</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tech">技术栈</Label>
              <select
                id="edit-tech"
                value={techStackTag}
                onChange={(e) => setTechStackTag(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all"
              >
                <option value="">选择技术栈</option>
                <option value="React">React</option>
                <option value="Vue">Vue</option>
                <option value="Flutter">Flutter</option>
                <option value="Vanilla JS">Vanilla JS</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-device">目标设备</Label>
            <select
              id="edit-device"
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all"
            >
              <option value="web">Web</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="harmony">HarmonyOS</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "保存中..." : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
