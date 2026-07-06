"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, User, Upload, LogOut } from "lucide-react"

interface UserMenuProps {
  user: {
    id: string
    name?: string | null
    image?: string | null
  }
  signOutAction: () => void
}

export default function UserMenu({ user, signOutAction }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors"
      >
        <Image
          src={user.image || "/default-avatar.svg"}
          alt={user.name || "User"}
          width={28}
          height={28}
          className="rounded-full ring-2 ring-border"
        />
        <span className="text-sm font-medium text-foreground hidden lg:inline max-w-[100px] truncate">
          {user.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg animate-fade-in-up z-50">
          <div className="p-1">
            <Link
              href={`/users/${user.id}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              我的主页
            </Link>
            <Link
              href="/publish"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Upload className="w-4 h-4 text-muted-foreground" />
              发布作品
            </Link>
            <hr className="my-1 border-border" />
            <button
              onClick={() => {
                setOpen(false)
                signOutAction()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
