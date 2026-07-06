import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { getUserDisplayName, getUserAvatarUrl } from "@/lib/utils"
import { canEditApp } from "@/lib/permissions"
import LikeButton from "./LikeButton"
import CommentForm from "./CommentForm"
import ReportButton from "./ReportButton"
import EditAppButton from "./EditAppButton"
import DeleteAppButton from "./DeleteAppButton"
import CommentDeleteButton from "./CommentDeleteButton"
import BuildLogPanel from "./BuildLogPanel"
import BuildHistory from "./BuildHistory"
import ForkButton from "./ForkButton"
import CollaboratorSection from "./CollaboratorSection"
import TipButton from "./TipButton"
import TipStats from "./TipStats"
import { TipSuccessToast } from "./TipSuccessToast"

const PhoneShell = dynamic(() => import("./PhoneShell"), {
  loading: () => (
    <div className="w-[320px] h-[650px] bg-card border-2 border-border rounded-[2.5rem] animate-pulse" />
  ),
})

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const app = await prisma.app.findUnique({
    where: { id },
    select: { title: true, description: true, aiToolTag: true, coverImage: true },
  })

  if (!app) return { title: "作品未找到" }

  const ogImageUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(app.title)}&tool=${encodeURIComponent(app.aiToolTag || "")}&type=app&template=gradient`

  return {
    title: app.title,
    description: app.description || `在 VibeDrop 上体验 ${app.title}`,
    openGraph: {
      title: `${app.title} | VibeDrop`,
      description: app.description || undefined,
      type: "article",
      images: [
        {
          url: app.coverImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: app.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: app.title,
      description: app.description || undefined,
      images: [app.coverImage || ogImageUrl],
    },
  }
}

export default async function AppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const app = await prisma.app.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          githubLogin: true,
          avatarUrl: true,
          name: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              githubLogin: true,
              avatarUrl: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
      forkedFrom: {
        select: {
          id: true,
          title: true,
        },
      },
      collaborators: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              githubLogin: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })

  if (!app) {
    notFound()
  }


  const hasLiked = session?.user
    ? await prisma.like.findUnique({
        where: {
          userId_appId: {
            userId: session.user.id as string,
            appId: app.id,
          },
        },
      })
    : null

  const builds = await prisma.build.findMany({
    where: { appId: app.id },
    orderBy: { startedAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      buildLog: true,
      artifactUrl: true,
      startedAt: true,
      completedAt: true,
    },
  })

  const currentUserId = session?.user?.id as string | undefined
  const isAuthor = currentUserId ? currentUserId === app.authorId : false
  const canEdit = currentUserId
    ? isAuthor || app.collaborators.some((c) => c.user.id === currentUserId)
    : false

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={null}>
          <TipSuccessToast />
        </Suspense>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Phone Player + Build Log */}
          <div>
            <PhoneShell
              playUrl={app.playUrl}
              buildStatus={app.buildStatus}
              appId={app.id}
              deviceType={app.deviceType}
            />
            <BuildLogPanel
              appId={app.id}
              buildStatus={app.buildStatus}
            />
            <div className="mt-4">
              <BuildHistory
                builds={builds}
                currentBuildId={app.buildId}
                canEdit={canEdit}
                appId={app.id}
              />
            </div>
          </div>

          {/* App Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">{app.title}</h1>
              <p className="text-muted-foreground mb-4">{app.description}</p>
              <TipStats tipsCount={app.tipsCount} tipsTotal={app.tipsTotal} />
              <Link
                href={`/users/${app.author.id}`}
                className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
              >
                <Image
                  src={getUserAvatarUrl(app.author)}
                  alt={getUserDisplayName(app.author)}
                  width={40}
                  height={40}
                  className="rounded-full ring-2 ring-border"
                />
                <div>
                  <p className="font-medium text-foreground hover:text-accent transition-colors">
                    {getUserDisplayName(app.author)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {app.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </Link>
              {app.forkedFrom && (
                <p className="text-xs text-muted-foreground mb-3">
                  Forked from{" "}
                  <Link
                    href={`/apps/${app.forkedFrom.id}`}
                    className="text-accent hover:underline"
                  >
                    {app.forkedFrom.title}
                  </Link>
                </p>
              )}
              <div className="flex gap-2 mb-4">
                {app.aiToolTag && (
                  <span className="text-sm bg-accent/20 text-accent px-3 py-1 rounded-full font-medium">
                    {app.aiToolTag}
                  </span>
                )}
                {app.techStackTag && (
                  <span className="text-sm bg-success/20 text-success px-3 py-1 rounded-full font-medium">
                    {app.techStackTag}
                  </span>
                )}
                <span className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded-full font-medium">
                  {app.deviceType}
                </span>
              </div>
              <div className="flex gap-4">
                <LikeButton
                  appId={app.id}
                  likesCount={app.likesCount}
                  hasLiked={!!hasLiked}
                />
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors btn-press">
                  <MessageCircle className="w-[18px] h-[18px]" />
                  {app.comments.length}
                </button>
                <ReportButton appId={app.id} />
                {/* Tip button: visible to logged-in users who are not the author or collaborator */}
                {session?.user && !canEdit && (
                  <TipButton appId={app.id} tipsCount={app.tipsCount} />
                )}
                {/* Fork button: visible to logged-in users who are not author or collaborator */}
                {session?.user && !canEdit && (
                  <ForkButton appId={app.id} forksCount={app.forksCount} />
                )}
              </div>

              {/* Author & Collaborator actions */}
              {canEdit && (
                <>
                  {/* Edit Code button (GitHub source only) */}
                  {app.sourceType === "github" && (
                    <div className="pt-3 border-t border-border mb-2">
                      <Link
                        href={`/apps/${app.id}/editor`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Code
                      </Link>
                    </div>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-border">
                    <EditAppButton
                      appId={app.id}
                      initialTitle={app.title}
                      initialDescription={app.description || ""}
                      initialAiToolTag={app.aiToolTag}
                      initialTechStackTag={app.techStackTag}
                      initialDeviceType={app.deviceType}
                    />
                    {/* Only the owner can delete */}
                    {isAuthor && <DeleteAppButton appId={app.id} />}
                  </div>
                </>
              )}
            </div>

            {/* Collaborators */}
            <CollaboratorSection
              appId={app.id}
              isAuthor={isAuthor}
              canEdit={canEdit}
              collaborators={app.collaborators}
            />

            {/* Comments */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">评论</h3>
              {session?.user ? (
                <CommentForm appId={app.id} />
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  <Link href="/auth/signin" className="text-accent hover:underline">
                    登录
                  </Link>
                  {" "}后发表评论
                </p>
              )}
              <div className="space-y-4">
                {app.comments.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    暂无评论，来发表第一条吧
                  </p>
                )}
                {app.comments.map((comment) => {
                  const canDeleteComment =
                    session?.user
                      ? session.user.id === comment.userId || canEdit
                      : false

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Image
                        src={getUserAvatarUrl(comment.user)}
                        alt={getUserDisplayName(comment.user)}
                        width={32}
                        height={32}
                        className="rounded-full ring-1 ring-border"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">
                            {getUserDisplayName(comment.user)}
                          </p>
                          <CommentDeleteButton
                            commentId={comment.id}
                            canDelete={canDeleteComment}
                          />
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                        <p className="text-muted-foreground/70 text-xs mt-1">
                          {comment.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
