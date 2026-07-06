"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AppError } from "@/lib/validations"

const ADMIN_IDS = process.env.ADMIN_GITHUB_IDS?.split(",") || []

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || !ADMIN_IDS.includes(session.user.id as string)) {
    throw AppError.forbidden("仅管理员可执行此操作")
  }
  return session
}

export async function resolveReport(reportId: string) {
  await requireAdmin()

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) throw AppError.notFound("举报不存在")

  await prisma.report.update({
    where: { id: reportId },
    data: { resolved: true },
  })

  revalidatePath("/admin/reports")
}

export async function deleteReport(reportId: string) {
  await requireAdmin()

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) throw AppError.notFound("举报不存在")

  await prisma.report.delete({ where: { id: reportId } })

  revalidatePath("/admin/reports")
}
