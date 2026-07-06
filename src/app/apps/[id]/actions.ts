"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  parseOrThrow,
  appIdSchema,
  addCommentSchema,
  reportAppSchema,
  editAppSchema,
  deleteAppSchema,
  AppError,
} from "@/lib/validations"
import { requireEditAccess, requireOwnerAccess, canEditApp } from "@/lib/permissions"

export async function likeApp(appId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  parseOrThrow(appIdSchema, { appId })

  const userId = session.user.id as string

  // Check if already liked
  const existing = await prisma.like.findUnique({
    where: { userId_appId: { userId, appId } },
  })

  if (existing) return existing

  // Create like and update count in a transaction
  const [like] = await prisma.$transaction([
    prisma.like.create({ data: { userId, appId } }),
    prisma.app.update({
      where: { id: appId },
      data: { likesCount: { increment: 1 } },
    }),
  ])

  revalidatePath(`/apps/${appId}`)
  revalidatePath("/apps")
  return like
}

export async function unlikeApp(appId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  parseOrThrow(appIdSchema, { appId })

  const userId = session.user.id as string

  // Delete like and update count in a transaction
  await prisma.$transaction([
    prisma.like.delete({
      where: { userId_appId: { userId, appId } },
    }),
    prisma.app.update({
      where: { id: appId },
      data: { likesCount: { decrement: 1 } },
    }),
  ])

  revalidatePath(`/apps/${appId}`)
  revalidatePath("/apps")
}

export async function addComment(appId: string, content: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(addCommentSchema, { appId, content })

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id as string,
      appId: validated.appId,
      content: validated.content,
    },
  })

  await prisma.app.update({
    where: { id: appId },
    data: { commentsCount: { increment: 1 } },
  })

  revalidatePath(`/apps/${appId}`)
  return comment
}

export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { app: true },
  })

  if (!comment) throw AppError.notFound("评论不存在")

  const isCommentAuthor = comment.userId === session.user.id
  const canModerate = await canEditApp(session.user.id as string, comment.appId)

  if (!isCommentAuthor && !canModerate) {
    throw AppError.forbidden("没有删除此评论的权限")
  }

  await prisma.$transaction([
    prisma.comment.delete({ where: { id: commentId } }),
    prisma.app.update({
      where: { id: comment.appId },
      data: { commentsCount: { decrement: 1 } },
    }),
  ])

  revalidatePath(`/apps/${comment.appId}`)
}

export async function reportApp(appId: string, reason: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(reportAppSchema, { appId, reason })

  await prisma.report.create({
    data: {
      appId: validated.appId,
      reporterId: session.user.id as string,
      reason: validated.reason,
    },
  })

  revalidatePath(`/apps/${appId}`)
}

export async function editApp(
  appId: string,
  data: {
    title: string
    description?: string
    aiToolTag?: string
    techStackTag?: string
    deviceType?: string
  }
) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(editAppSchema, { appId, ...data })

  const app = await prisma.app.findUnique({ where: { id: validated.appId } })
  if (!app) throw AppError.notFound("作品不存在")
  await requireEditAccess(session.user.id as string, validated.appId)

  const updated = await prisma.app.update({
    where: { id: validated.appId },
    data: {
      title: validated.title,
      description: validated.description || null,
      aiToolTag: validated.aiToolTag || null,
      techStackTag: validated.techStackTag || null,
      deviceType: validated.deviceType,
    },
  })

  revalidatePath(`/apps/${appId}`)
  revalidatePath("/apps")
  return updated
}

export async function deleteApp(appId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(deleteAppSchema, { appId })

  const app = await prisma.app.findUnique({ where: { id: validated.appId } })
  if (!app) throw AppError.notFound("作品不存在")
  await requireOwnerAccess(session.user.id as string, validated.appId)

  // Cascade delete in a transaction
  await prisma.$transaction([
    prisma.report.deleteMany({ where: { appId: validated.appId } }),
    prisma.like.deleteMany({ where: { appId: validated.appId } }),
    prisma.comment.deleteMany({ where: { appId: validated.appId } }),
    prisma.collaborator.deleteMany({ where: { appId: validated.appId } }),
    prisma.tip.deleteMany({ where: { appId: validated.appId } }),
    prisma.build.deleteMany({ where: { appId: validated.appId } }),
    prisma.app.delete({ where: { id: validated.appId } }),
  ])

  revalidatePath("/apps")
  revalidatePath(`/users/${session.user.id}`)
  return { deleted: true }
}

export async function rollbackApp(appId: string, buildId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  parseOrThrow(appIdSchema, { appId })

  // Validate buildId is a UUID
  if (!buildId || typeof buildId !== "string" || buildId.length !== 36) {
    throw AppError.badRequest("无效的构建 ID")
  }

  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app) throw AppError.notFound("作品不存在")
  await requireEditAccess(session.user.id as string, appId)

  const build = await prisma.build.findUnique({ where: { id: buildId } })
  if (!build || build.appId !== appId) throw AppError.notFound("构建记录不存在")
  if (build.status !== "success" || !build.artifactUrl) {
    throw AppError.badRequest("只能回滚到构建成功的版本")
  }

  // Already on this build
  if (app.buildId === buildId) {
    throw AppError.badRequest("已经是当前版本")
  }

  await prisma.app.update({
    where: { id: appId },
    data: { playUrl: build.artifactUrl, buildId: build.id },
  })

  revalidatePath(`/apps/${appId}`)
  return { rolledBack: true, buildId: build.id }
}

export async function forkApp(appId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  parseOrThrow(appIdSchema, { appId })

  const original = await prisma.app.findUnique({
    where: { id: appId },
    include: { author: true },
  })

  if (!original) throw AppError.notFound("作品不存在")
  if (original.authorId === session.user.id) {
    throw AppError.badRequest("不能 Fork 自己的作品")
  }
  // Also prevent collaborators from forking apps they collaborate on
  if (await canEditApp(session.user.id as string, appId)) {
    throw AppError.badRequest("不能 Fork 自己参与的作品")
  }

  // Create the forked app
  const forked = await prisma.app.create({
    data: {
      title: `${original.title} (Fork)`,
      description: original.description,
      coverImage: original.coverImage,
      sourceType: original.sourceType,
      sourceUrl: original.sourceUrl,
      aiToolTag: original.aiToolTag,
      techStackTag: original.techStackTag,
      deviceType: original.deviceType,
      forkedFromId: original.id,
      authorId: session.user.id as string,
    },
  })

  // Increment forksCount on original
  await prisma.app.update({
    where: { id: original.id },
    data: { forksCount: { increment: 1 } },
  })

  // Auto-create pending build for the fork
  if (original.sourceUrl || original.sourceType === "github") {
    await prisma.build.create({
      data: {
        appId: forked.id,
        status: "pending",
        sourceType: original.sourceType,
        sourceUrl: original.sourceUrl,
      },
    })

    await prisma.app.update({
      where: { id: forked.id },
      data: { buildStatus: "pending" },
    })
  }

  revalidatePath(`/apps/${appId}`)
  revalidatePath("/apps")
  return { forkedId: forked.id }
}
