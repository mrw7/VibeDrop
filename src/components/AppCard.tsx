import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getUserDisplayName, getUserAvatarUrl } from "@/lib/utils"

interface AppCardAuthor {
  id: string
  name?: string | null
  githubLogin?: string | null
  image: string | null
}

interface AppCardProps {
  id: string
  title: string
  description: string | null
  coverImage: string | null
  author: AppCardAuthor
  likesCount: number
  commentsCount: number
  aiToolTag: string | null
  techStackTag: string | null
  buildStatus: string
  createdAt: Date
}

export default function AppCard({
  id,
  title,
  description,
  coverImage,
  author,
  likesCount,
  commentsCount,
  aiToolTag,
  techStackTag,
  buildStatus,
  createdAt,
}: AppCardProps) {
  return (
    <Link
      href={`/apps/${id}`}
      className="group relative card-hover bg-card rounded-none border-2 border-border overflow-hidden animate-fade-in-up break-inside-avoid"
    >
      <div className="relative overflow-hidden bg-muted" style={{ minHeight: "160px" }}>
        {coverImage ? (
          <Image
            src={coverImage}
            alt={title}
            width={0}
            height={0}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto transition-transform duration-500 group-hover:scale-105 pixelated"
            unoptimized={coverImage?.startsWith("https://")}
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[160px] bg-pixel-grid">
            <ImageIcon className="w-12 h-12 text-[var(--color-neon-cyan)] opacity-40" />
          </div>
        )}
        {buildStatus !== "success" && (
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                buildStatus === "building" || buildStatus === "pending"
                  ? "warning"
                  : buildStatus === "failed"
                  ? "destructive"
                  : "default"
              }
            >
              {buildStatus === "pending"
                ? "WAIT"
                : buildStatus === "building"
                ? "BUILD"
                : buildStatus === "failed"
                ? "FAIL"
                : ""}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-foreground mb-1 group-hover:neon-text-pink transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {description || "暂无描述"}
        </p>
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/users/${author.id}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src={getUserAvatarUrl(author)}
              alt={getUserDisplayName(author)}
              width={24}
              height={24}
              className="rounded-none pixelated border border-[var(--color-neon-cyan)]"
            />
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {getUserDisplayName(author)}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-pixel text-[0.65rem]">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              {likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-[var(--color-neon-cyan)]" />
              {commentsCount}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {aiToolTag && <Badge variant="accent">{aiToolTag}</Badge>}
          {techStackTag && <Badge variant="secondary">{techStackTag}</Badge>}
        </div>
      </div>
    </Link>
  )
}
