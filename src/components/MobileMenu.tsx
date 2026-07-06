"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
  user: {
    name?: string | null
    image?: string | null
  } | null
  signOutAction: () => void
}

export default function MobileMenu({ user, signOutAction }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="sm:hidden"
        aria-label="打开菜单"
      >
        <Menu className="w-5 h-5" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-64 bg-card border-l border-border animate-fade-in-up">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link
                href="/"
                className="text-lg font-bold text-foreground"
                onClick={() => setOpen(false)}
              >
                VibeDrop
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="关闭菜单"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-2">
              <Link
                href="/apps"
                className="block px-3 py-2 rounded-md text-foreground hover:bg-secondary transition-colors"
                onClick={() => setOpen(false)}
              >
                发现作品
              </Link>

              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 border-t border-border mt-4">
                    <Image
                      src={user.image || "/default-avatar.svg"}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full ring-2 ring-border"
                    />
                    <span className="text-sm font-medium text-foreground">{user.name}</span>
                  </div>
                  <Link
                    href="/publish"
                    className="block px-3 py-2 rounded-md bg-accent text-accent-foreground text-center font-medium hover:opacity-90 transition-opacity"
                    onClick={() => setOpen(false)}
                  >
                    发布作品
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false)
                      signOutAction()
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    退出登录
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 rounded-md bg-primary text-primary-foreground text-center font-medium hover:opacity-90 transition-opacity mt-4"
                  onClick={() => setOpen(false)}
                >
                  登录
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
