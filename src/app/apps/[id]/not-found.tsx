import Link from "next/link"
import { Frown, Search, Home } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

export default function AppNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Frown className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">作品未找到</h1>
          <p className="text-muted-foreground mb-8">该作品可能已被删除或链接地址错误</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/apps">
                <Search className="w-4 h-4" />
                浏览其他作品
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
