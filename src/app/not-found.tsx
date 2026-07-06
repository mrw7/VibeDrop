import Link from "next/link"
import { Compass, Home } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">404</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">页面未找到</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            你访问的页面不存在或已被移除。检查链接是否正确，或返回首页。
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/apps">
                <Compass className="w-4 h-4" />
                浏览作品
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="w-4 h-4" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
