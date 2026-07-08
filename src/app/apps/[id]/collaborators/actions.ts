"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  parseOrThrow,
  addCollaboratorSchema,
  removeCollaboratorSchema,
  AppError,
} from "@/lib/validations"
import { requireOwnerAccess } from "@/lib/permissions"

export async function addCollaborator(appId: string, userId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(addCollaboratorSchema, { appId, userId })

  // Only the owner can add collaborators
  const app = await prisma.app.findUnique({ where: { id: validated.appId } })
  if (!app) throw AppError.notFound("作品不存在")
  if (app.authorId !== session.user.id) throw AppError.forbidden()

  // Cannot add yourself
  if (validated.userId === session.user.id) {
    throw AppError.badRequest("不能添加自己为协作者")
  }

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: validated.userId } })
  if (!user) throw AppError.notFound("用户不存在")

  // Check not already a collaborator
  const existing = await prisma.collaborator.findUnique({
    where: { appId_userId: { appId: validated.appId, userId: validated.userId } },
  })
  if (existing) throw AppError.conflict("已是协作者")

  await prisma.collaborator.create({
    data: { appId: validated.appId, userId: validated.userId, role: "editor" },
  })

  revalidatePath(`/apps/${validated.appId}`)
  revalidatePath(`/users/${validated.userId}`)
}

export async function removeCollaborator(appId: string, userId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(removeCollaboratorSchema, { appId, userId })

  // Only the owner can remove collaborators
  await requireOwnerAccess(session.user.id as string, validated.appId)

  await prisma.collaborator.delete({
    where: { appId_userId: { appId: validated.appId, userId: validated.userId } },
  })

  revalidatePath(`/apps/${validated.appId}`)
  revalidatePath(`/users/${validated.userId}`)
}

export async function listCollaborators(appId: string) {
  return prisma.collaborator.findMany({
    where: { appId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          githubLogin: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}
