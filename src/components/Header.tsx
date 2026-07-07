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
        <Logo href="/" size="lg" />

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-3">
          <Link
            href="/apps"
            className="font-pixel text-[0.65rem] text-foreground hover:neon-text-cyan transition-colors px-3 py-2"
          >
            DISCOVER
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3 ml-2">
              <Button asChild variant="accent" size="default" className="md:inline-flex btn-press font-pixel neon-glow">
                <Link href="/publish">PUBLISH</Link>
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
            <Button asChild variant="accent" size="default" className="btn-press font-pixel neon-glow">
              <Link href="/auth/signin">LOGIN</Link>
            </Button>
          )}

          <div className="ml-2 pl-2 border-l-2 border-border">
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
