import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { createApp } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

export default async function PublishPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">发布作品</h1>
          <p className="text-muted-foreground mt-2">分享你的 Vibe Coding 创作，让社区即时体验</p>
        </div>

        <form action={createApp} className="space-y-6 animate-fade-in-up">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">标题 <span className="text-destructive">*</span></Label>
            <Input id="title" name="title" required placeholder="给你的作品起个名字" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea id="description" name="description" rows={4} placeholder="介绍你的作品..." />
          </div>

          {/* Source Type */}
          <div className="space-y-3">
            <Label>发布方式 <span className="text-destructive">*</span></Label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="sourceType" value="zip" defaultChecked className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">上传 ZIP 文件</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="radio" name="sourceType" value="github" className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">GitHub 仓库</span>
              </label>
            </div>
          </div>

          {/* ZIP Upload */}
          <div className="p-4 rounded-lg border border-dashed border-border bg-muted/50 space-y-2">
            <Label htmlFor="zipFile">ZIP 文件</Label>
            <Input
              id="zipFile"
              name="zipFile"
              type="file"
              accept=".zip"
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">最大 100MB</p>
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">GitHub 仓库地址</Label>
            <Input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              placeholder="https://github.com/username/repo"
            />
          </div>

          {/* Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aiToolTag">AI 工具</Label>
              <select id="aiToolTag" name="aiToolTag" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all">
                <option value="">选择工具</option>
                <option value="Cursor">Cursor</option>
                <option value="v0">v0</option>
                <option value="Bolt">Bolt</option>
                <option value="Lovable">Lovable</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="techStackTag">技术栈</Label>
              <select id="techStackTag" name="techStackTag" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all">
                <option value="">选择技术栈</option>
                <option value="React">React</option>
                <option value="Vue">Vue</option>
                <option value="Flutter">Flutter</option>
                <option value="Vanilla JS">Vanilla JS</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <Label htmlFor="deviceType">目标设备</Label>
            <select id="deviceType" name="deviceType" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all">
              <option value="web">Web</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
              <option value="harmony">HarmonyOS</option>
            </select>
          </div>

          {/* Cover Image */}
          <div className="p-4 rounded-lg border border-dashed border-border bg-muted/50 space-y-2">
            <Label htmlFor="coverImage">封面图</Label>
            <Input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/*"
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">最大 5MB，支持 jpg/png/webp</p>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Upload className="w-4 h-4" />
              发布
            </Button>
            <Button variant="outline" asChild>
              <Link href="/apps">取消</Link>
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
