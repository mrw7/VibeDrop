"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { parseOrThrow, triggerBuildSchema, AppError } from "@/lib/validations"
import { requireEditAccess } from "@/lib/permissions"

export async function triggerBuild(appId: string) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  const validated = parseOrThrow(triggerBuildSchema, { appId })

  const app = await prisma.app.findUnique({
    where: { id: validated.appId },
    include: { author: true },
  })

  if (!app) throw AppError.notFound("作品不存在")
  await requireEditAccess(session.user.id as string, app.id)

  // Check if there's already a pending or in-progress build
  const existingBuild = await prisma.build.findFirst({
    where: {
      appId: app.id,
      status: { in: ["pending", "building"] },
    },
  })

  if (existingBuild) {
    throw AppError.conflict("A build is already in progress for this app")
  }

  // Create a pending build record — the worker picks it up
  const build = await prisma.build.create({
    data: {
      appId: app.id,
      status: "pending",
      sourceType: app.sourceType,
      sourceUrl: app.sourceUrl,
    },
  })

  // Update app build status
  await prisma.app.update({
    where: { id: app.id },
    data: {
      buildStatus: "pending",
      buildId: build.id,
    },
  })

  revalidatePath(`/apps/${appId}`)
  return build
}

export async function getBuildStatus(buildId: string) {
  const build = await prisma.build.findUnique({
    where: { id: buildId },
  })

  if (!build) {
    throw AppError.notFound("Build not found")
  }

  return build
}
