import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  href?: string
  className?: string
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
}

const SIZE_MAP = {
  sm: { box: "w-6 h-6", text: "text-[0.6rem]", radius: "rounded-none", glyph: 12 },
  md: { box: "w-8 h-8", text: "text-sm", radius: "rounded-none", glyph: 16 },
  lg: { box: "w-10 h-10", text: "text-lg", radius: "rounded-none", glyph: 20 },
}

/**
 * VibeDrop 像素风 Logo:霓虹方块图标 + 像素字体的字标。
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
      <span
        className={cn(
          s.box,
          s.radius,
          "bg-[var(--color-accent)] flex items-center justify-center shrink-0",
          "border-2 border-[var(--color-accent)] neon-glow",
        )}
        aria-hidden="true"
      >
        <svg
          width={s.glyph}
          height={s.glyph}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="square"
          strokeLinejoin="miter"
          shapeRendering="crispEdges"
        >
          {/* 像素化水滴 */}
          <path d="M12 3l6 8a6 6 0 0 1-12 0z" />
        </svg>
      </span>
      {showWordmark && (
        <span className={cn(s.text, "font-pixel text-foreground")}>
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
