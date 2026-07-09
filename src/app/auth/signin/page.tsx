import Link from "next/link"
import { Github, ArrowLeft } from "lucide-react"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden scanlines">
      <div className="absolute inset-0 bg-pixel-grid pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] glow-neon-radial pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 bg-card/90 backdrop-blur-sm border-2 border-border p-8 rounded-none max-w-md w-full mx-4 animate-fade-in-up pixel-shadow">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Logo size="lg" />
          </div>
          <p className="text-muted-foreground mt-2">
            Sign in with your GitHub account
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full font-pixel" size="lg">
            <Link href="/api/auth/signin/github">
              <Github className="w-5 h-5" />
              SIGN IN WITH GITHUB
            </Link>
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
