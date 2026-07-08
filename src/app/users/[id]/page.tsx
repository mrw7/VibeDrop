import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import AppCard from "@/components/AppCard"
import { getUserDisplayName, getUserAvatarUrl } from "@/lib/utils"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      apps: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          apps: true,
          likes: true,
          comments: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  // Aggregate tip stats
  const tipAgg = await prisma.tip.aggregate({
    where: { recipientId: id },
    _count: { id: true },
    _sum: { amount: true },
  })

  // Fetch apps the user collaborates on
  const collaborations = await prisma.collaborator.findMany({
    where: { userId: id },
    include: {
      app: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              githubLogin: true,
              image: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Image
              src={getUserAvatarUrl(user)}
              alt={getUserDisplayName(user)}
              width={96}
              height={96}
              className="rounded-full ring-4 ring-border"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {getUserDisplayName(user)}
              </h1>
              <p className="text-muted-foreground mb-4">
                {user.githubId ? "通过 GitHub 登录" : "通过邮箱注册"}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-6">
                <StatBadge label="作品" value={user._count.apps} />
                <StatBadge label="点赞" value={user._count.likes} />
                <StatBadge label="评论" value={user._count.comments} />
                {tipAgg._count.id > 0 && (
                  <StatBadge
                    label="打赏"
                    value={tipAgg._count.id}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* User's Apps */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">
            发布的 {user._count.apps} 个作品
          </h2>

          {user.apps.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground">暂无作品</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {user.apps.map((app) => (
                <AppCard
                  key={app.id}
                  id={app.id}
                  title={app.title}
                  description={app.description}
                  coverImage={app.coverImage}
                  author={user}
                  likesCount={app.likesCount}
                  commentsCount={app.commentsCount}
                  aiToolTag={app.aiToolTag}
                  techStackTag={app.techStackTag}
                  buildStatus={app.buildStatus}
                  createdAt={app.createdAt}
                />
              ))}
            </div>
          )}
        </section>

        {/* Collaborated Apps */}
        {collaborations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              协作的 {collaborations.length} 个作品
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {collaborations.map((collab) => (
                <div key={collab.id} className="relative">
                  <AppCard
                    id={collab.app.id}
                    title={collab.app.title}
                    description={collab.app.description}
                    coverImage={collab.app.coverImage}
                    author={collab.app.author}
                    likesCount={collab.app.likesCount}
                    commentsCount={collab.app.commentsCount}
                    aiToolTag={collab.app.aiToolTag}
                    techStackTag={collab.app.techStackTag}
                    buildStatus={collab.app.buildStatus}
                    createdAt={collab.app.createdAt}
                  />
                  <span className="absolute top-2 right-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium">
                    协作
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
