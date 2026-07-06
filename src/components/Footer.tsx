import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity"
            >
              VibeDrop
            </Link>
            <span className="text-sm text-muted-foreground">
              — 分享 Vibe Coding 作品
            </span>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/apps"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              发现作品
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/publish"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              发布作品
            </Link>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} VibeDrop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
