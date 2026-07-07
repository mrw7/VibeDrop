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
      <section className="relative overflow-hidden">
        {/* 装饰:网格背景 + 顶部柔光 */}
        <div className="absolute inset-0 bg-grid pointer-events-none" aria-hidden="true" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] glow-brand pointer-events-none" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-20 text-center">
          {/* 上方小标签 */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            AI 生成应用,即刻试玩
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up">
            分享你的{" "}
            <span className="text-gradient">Vibe Coding</span>{" "}
            作品
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
            VibeDrop 是面向 Vibe Coding 社区的应用分享与试玩平台。
            上传你的 AI 生成应用,让全世界即时体验。
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
            {session?.user ? (
              <Button asChild variant="gradient" size="lg" className="btn-press">
                <Link href="/publish">立即发布</Link>
              </Button>
            ) : (
              <Button asChild variant="gradient" size="lg" className="btn-press">
                <Link href="/auth/signin">登录开始创作</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="btn-press">
              <Link href="/apps">
                浏览作品
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* 统计 */}
          {(appCount > 0 || userCount > 0) && (
            <div className="mt-16 flex items-center justify-center gap-8 sm:gap-12 animate-fade-in">
              <Stat value={appCount} label="个作品" />
              <div className="w-px h-10 bg-border" />
              <Stat value={userCount} label="位创作者" />
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="pb-24 stagger-children">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Smartphone className="w-6 h-6" />}
              title="手机外壳试玩"
              description="在 iPhone 和 Android 外壳中即时体验应用,支持全屏模式"
            />
            <FeatureCard
              icon={<Rocket className="w-6 h-6" />}
              title="一键发布"
              description="上传 ZIP 或连接 GitHub 仓库,自动构建并发布"
            />
            <FeatureCard
              icon={<Tag className="w-6 h-6" />}
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
      <div className="text-2xl sm:text-3xl font-bold text-gradient">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
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
    <div className="card-hover bg-card text-card-foreground p-6 rounded-xl border border-border shadow-soft animate-fade-in-up">
      <div className="w-12 h-12 mb-4 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-soft">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
