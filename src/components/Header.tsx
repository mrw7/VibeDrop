import { auth, signOut } from "@/lib/auth"
import Link from "next/link"
import Logo from "./Logo"
import MobileMenu from "./MobileMenu"
import ThemeToggle from "./ThemeToggle"
import UserMenu from "./UserMenu"
import { Button } from "@/components/ui/button"

export default async function Header() {
  const session = await auth()

  async function handleSignOut() {
    "use server"
    await signOut({ redirectTo: "/" })
  }

  return (
    <header className="glass sticky top-0 z-50 animate-fade-in">
      <a href="#main-content" className="skip-to-content">
        跳转到主内容
      </a>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Logo href="/" size="md" />

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/apps"
            className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            发现
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-2 ml-2">
              <Button asChild variant="neon" size="sm" className="hidden md:inline-flex btn-press">
                <Link href="/publish">发布作品</Link>
              </Button>
              <UserMenu
                user={{
                  id: session.user.id as string,
                  name: session.user.name,
                  image: session.user.image,
                }}
                signOutAction={handleSignOut}
              />
            </div>
          ) : (
            <Button asChild variant="neon" size="sm" className="ml-2 btn-press">
              <Link href="/auth/signin">登录</Link>
            </Button>
          )}

          <div className="ml-2 pl-2 border-l border-border">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile: ThemeToggle + Hamburger */}
        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <MobileMenu
            user={
              session?.user
                ? { name: session.user.name, image: session.user.image }
                : null
            }
            signOutAction={handleSignOut}
          />
        </div>
      </div>
    </header>
  )
}
