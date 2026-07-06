import { auth } from "@/lib/auth"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default async function Home() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-24 sm:py-32 text-center animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            分享你的{" "}
            <span className="text-accent">Vibe Coding</span>{" "}
            作品
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台。
            上传你的 AI 生成应用，让全世界即时体验。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {session?.user ? (
              <Link
                href="/publish"
                className="btn-press bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
              >
                立即发布
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-press bg-primary text-primary-foreground px-8 py-3.5 rounded-lg text-base font-medium hover:opacity-90 transition-opacity"
              >
                登录
              </Link>
            )}
            <Link
              href="/apps"
              className="btn-press bg-secondary text-secondary-foreground px-8 py-3.5 rounded-lg text-base font-medium border border-border hover:bg-muted transition-colors"
            >
              浏览作品
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="pb-24 stagger-children">
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="📱"
              title="手机外壳试玩"
              description="在 iPhone 和 Android 外壳中即时体验应用，支持全屏模式"
            />
            <FeatureCard
              icon="🚀"
              title="一键发布"
              description="上传 ZIP 或连接 GitHub 仓库，自动构建并发布"
            />
            <FeatureCard
              icon="🏷️"
              title="Vibe 标签"
              description="标记使用的 AI 工具（Cursor、v0、Bolt 等）和技术栈"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="card-hover bg-card text-card-foreground p-6 rounded-xl border border-border animate-fade-in-up">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )
}
