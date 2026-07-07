import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Smartphone, Rocket, Tag, ArrowRight } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const session = await auth()

  // 统计数据(容错:DB 不可达时隐藏统计条,不影响首页渲染)
  let appCount = 0
  let userCount = 0
  try {
    ;[appCount, userCount] = await Promise.all([
      prisma.app.count({ where: { buildStatus: "success" } }),
      prisma.user.count(),
    ])
  } catch {
    // 忽略 — 统计为装饰性,不阻塞首页
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden scanlines">
        {/* 装饰:像素网格 + 霓虹柔光 */}
        <div className="absolute inset-0 bg-pixel-grid pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] glow-neon-radial pointer-events-none" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-20 text-center">
          {/* 上方小标签 */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-10 border-2 border-[var(--color-neon-cyan)] text-[0.6rem] font-pixel uppercase tracking-widest neon-text-cyan animate-flicker">
            <span className="w-1.5 h-1.5 bg-[var(--color-neon-cyan)]" />
            AI APPS · 即刻试玩
          </div>

          <h1 className="font-pixel text-3xl sm:text-5xl lg:text-6xl leading-tight mb-8 animate-fade-in-up">
            <span className="block neon-text-cyan mb-3">SHARE YOUR</span>
            <span className="block neon-text-pink">VIBE CODING</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            VibeDrop 是面向 Vibe Coding 社区的应用分享与试玩平台。
            上传你的 AI 生成应用,让全世界即时体验。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up">
            {session?.user ? (
              <Button asChild variant="neon" size="lg" className="btn-press font-pixel">
                <Link href="/publish">发布作品</Link>
              </Button>
            ) : (
              <Button asChild variant="neon" size="lg" className="btn-press font-pixel">
                <Link href="/auth/signin">登录创作</Link>
              </Button>
            )}
            <Button asChild variant="neonCyan" size="lg" className="btn-press font-pixel">
              <Link href="/apps">
                浏览作品
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* 统计 */}
          {(appCount > 0 || userCount > 0) && (
            <div className="mt-20 flex items-center justify-center gap-10 sm:gap-16 animate-fade-in">
              <Stat value={appCount} label="APPS" />
              <div className="w-px h-12 bg-[var(--color-border)]" />
              <Stat value={userCount} label="MAKERS" />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="relative pb-24 stagger-children">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Smartphone className="w-5 h-5" />}
              title="手机外壳试玩"
              description="在 iPhone 和 Android 外壳中即时体验应用,支持全屏模式"
            />
            <FeatureCard
              icon={<Rocket className="w-5 h-5" />}
              title="一键发布"
              description="上传 ZIP 或连接 GitHub 仓库,自动构建并发布"
            />
            <FeatureCard
              icon={<Tag className="w-5 h-5" />}
              title="Vibe 标签"
              description="标记使用的 AI 工具(Cursor、v0、Bolt 等)和技术栈"
            />
          </div>
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-pixel text-2xl sm:text-3xl neon-text-pink">{value}</div>
      <div className="text-xs text-muted-foreground mt-2 font-pixel">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card-hover bg-card text-card-foreground p-6 rounded-none border-2 border-border animate-fade-in-up">
      <div className="w-12 h-12 mb-4 rounded-none bg-transparent border-2 border-[var(--color-accent)] flex items-center justify-center text-[var(--color-accent)] neon-glow">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2 font-pixel text-base">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
