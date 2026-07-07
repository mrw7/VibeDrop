import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Suspense } from "react"
import { Search, Package } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AppCard from "@/components/AppCard"
import FilterBar from "@/components/FilterBar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 12

interface SearchParams {
  q?: string
  aiTool?: string
  techStack?: string
  offset?: string
}

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  const { q, aiTool, techStack, offset } = await searchParams
  const currentOffset = parseInt(offset || "0", 10)

  // Build WHERE clause dynamically for multi-filter support
  const conditions: string[] = []
  const params: string[] = []
  let paramIdx = 1

  if (q) {
    conditions.push(`(a.title ILIKE $${paramIdx} OR a.description ILIKE $${paramIdx})`)
    params.push(`%${q}%`)
    paramIdx++
  }
  if (aiTool) {
    conditions.push(`a."aiToolTag" = $${paramIdx}`)
    params.push(aiTool)
    paramIdx++
  }
  if (techStack) {
    conditions.push(`a."techStackTag" = $${paramIdx}`)
    params.push(techStack)
    paramIdx++
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

  // Hot score: (likes*1 + comments*2) / (hours_since_creation + 2)^1.5
  const apps = await prisma.$queryRawUnsafe<
    Array<{
      id: string; title: string; description: string | null; coverImage: string | null
      authorId: string; sourceType: string; sourceUrl: string | null
      buildStatus: string; buildId: string | null; playUrl: string | null
      aiToolTag: string | null; techStackTag: string | null; deviceType: string
      likesCount: number; commentsCount: number; createdAt: Date; updatedAt: Date
      authorId_1: string; githubLogin: string; avatarUrl: string | null
    }>
  >(
    `SELECT a.*,
            u.id as "authorId_1", u."githubLogin", u."avatarUrl", u."name"
     FROM "App" a
     JOIN "User" u ON a."authorId" = u.id
     ${whereClause}
     ORDER BY
       (a."likesCount" * 1 + a."commentsCount" * 2) /
       POWER(EXTRACT(EPOCH FROM (NOW() - a."createdAt")) / 3600 + 2, 1.5) DESC
     LIMIT ${PAGE_SIZE} OFFSET ${currentOffset}`,
    ...params,
  )

  const sortedApps = apps.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    coverImage: row.coverImage,
    sourceType: row.sourceType,
    sourceUrl: row.sourceUrl,
    buildStatus: row.buildStatus,
    buildId: row.buildId,
    playUrl: row.playUrl,
    aiToolTag: row.aiToolTag,
    techStackTag: row.techStackTag,
    deviceType: row.deviceType,
    likesCount: row.likesCount,
    commentsCount: row.commentsCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author: {
      id: row.authorId_1,
      githubLogin: row.githubLogin,
      avatarUrl: row.avatarUrl,
      name: null, // name not selected in this query for performance
    },
  }))

  const hasMore = apps.length === PAGE_SIZE

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 animate-fade-in">
          <h1 className="font-pixel text-2xl sm:text-3xl neon-text-pink mb-2">
            COMMUNITY APPS
          </h1>
          <p className="text-muted-foreground mb-6">发现来自社区的 Vibe Coding 杰作</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <form className="flex-1" action="/apps" method="GET">
              {/* Preserve active filters when searching */}
              {aiTool && <input type="hidden" name="aiTool" value={aiTool} />}
              {techStack && <input type="hidden" name="techStack" value={techStack} />}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="搜索作品..."
                  className="pl-10"
                />
              </div>
            </form>
            <Suspense fallback={
              <div className="flex gap-2">
                <div className="h-10 w-36 bg-muted rounded-lg animate-pulse" />
                <div className="h-10 w-36 bg-muted rounded-lg animate-pulse" />
              </div>
            }>
              <FilterBar />
            </Suspense>
          </div>
        </div>

        {/* App Grid — CSS Masonry */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6 stagger-children">
          {sortedApps.map((app) => (
            <AppCard
              key={app.id}
              id={app.id}
              title={app.title}
              description={app.description}
              coverImage={app.coverImage}
              author={app.author}
              likesCount={app.likesCount}
              commentsCount={app.commentsCount}
              aiToolTag={app.aiToolTag}
              techStackTag={app.techStackTag}
              buildStatus={app.buildStatus}
              createdAt={app.createdAt}
            />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="btn-press">
              <Link
                href={`/apps?${new URLSearchParams({
                  ...(q && { q }),
                  ...(aiTool && { aiTool }),
                  ...(techStack && { techStack }),
                  offset: String(currentOffset + PAGE_SIZE),
                }).toString()}`}
                scroll={false}
              >
                加载更多
              </Link>
            </Button>
          </div>
        )}

        {sortedApps.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-none border-2 border-[var(--color-neon-cyan)] flex items-center justify-center text-[var(--color-neon-cyan)] neon-glow-cyan">
              <Package className="w-8 h-8" />
            </div>
            <p className="text-muted-foreground text-lg mb-4 font-pixel text-sm">
              {q ? `NO RESULTS FOR "${q}"` : "暂无作品,快来发布第一个!"}
            </p>
            <Button asChild variant="neon" className="btn-press font-pixel">
              <Link href="/publish">发布作品</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
