import { prisma } from "./prisma"
import { AppError } from "./validations"

/**
 * Check if a user can edit an app (author or editor collaborator).
 */
export async function canEditApp(
  userId: string,
  appId: string,
): Promise<boolean> {
  const app = await prisma.app.findUnique({
    where: { id: appId },
    select: { authorId: true },
  })
  if (!app) return false
  if (app.authorId === userId) return true

  const collab = await prisma.collaborator.findUnique({
    where: { appId_userId: { appId, userId } },
  })
  return collab?.role === "editor"
}

/**
 * Check if a user can manage an app (owner only).
 * Owners can delete the app and manage collaborators — editors cannot.
 */
export async function canManageApp(
  userId: string,
  appId: string,
): Promise<boolean> {
  const app = await prisma.app.findUnique({
    where: { id: appId },
    select: { authorId: true },
  })
  if (!app) return false
  return app.authorId === userId
}

/**
 * Throw if the user does not have edit access.
 * Use in server actions that editors and owners can both perform.
 */
export async function requireEditAccess(
  userId: string,
  appId: string,
): Promise<void> {
  if (!(await canEditApp(userId, appId))) {
    throw AppError.forbidden()
  }
}

/**
 * Throw if the user is not the owner.
 * Use in server actions that only the owner can perform
 * (delete app, manage collaborators).
 */
export async function requireOwnerAccess(
  userId: string,
  appId: string,
): Promise<void> {
  if (!(await canManageApp(userId, appId))) {
    throw AppError.forbidden()
  }
}
