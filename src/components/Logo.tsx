import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  className?: string
  /** 字标大小:text-lg(默认) / text-xl / text-2xl */
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
}

const SIZE_MAP = {
  sm: { box: "w-7 h-7", text: "text-base", radius: "rounded-md", glyph: 14 },
  md: { box: "w-8 h-8", text: "text-lg", radius: "rounded-lg", glyph: 16 },
  lg: { box: "w-10 h-10", text: "text-2xl", radius: "rounded-xl", glyph: 20 },
}

/**
 * VibeDrop brand logo: 紫蓝渐变方块图标 + 字标。
 * 全站复用(Header / Footer / Auth 页)。
 */
export default function Logo({
  href = "/",
  className,
  size = "md",
  showWordmark = true,
}: LogoProps) {
  const s = SIZE_MAP[size]
  const content = (
    <span className={cn("flex items-center gap-2", className)}>
      {/* 渐变图标方块 */}
      <span
        className={cn(
          s.box,
          s.radius,
          "bg-brand-gradient flex items-center justify-center shadow-soft shrink-0"
        )}
        aria-hidden="true"
      >
        <svg
          width={s.glyph}
          height={s.glyph}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* 水滴形态 — 呼应 "Drop" */}
          <path d="M12 2.5c3.5 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 2.5-6.5 6-10.5z" />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn(s.text, "font-bold tracking-tight text-foreground")}>
          VibeDrop
        </span>
      )}
    </span>
  )

  if (!href) return content
  return (
    <Link href={href} className="hover:opacity-90 transition-opacity">
      {content}
    </Link>
  )
}
