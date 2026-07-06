import Link from "next/link"
import { UserX, Compass } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <UserX className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">用户不存在</h1>
          <p className="text-muted-foreground mb-8">该用户可能已注销或链接地址错误</p>
          <Button variant="outline" asChild>
            <Link href="/apps">
              <Compass className="w-4 h-4" />
              浏览作品
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
