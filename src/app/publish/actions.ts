"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { uploadToOSS } from "@/lib/oss"
import { parseOrThrow, createAppSchema, AppError } from "@/lib/validations"

export async function createApp(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw AppError.unauthorized()

  // Parse and validate form data through Zod
  const raw = {
    title: formData.get("title"),
    description: formData.get("description") || "",
    sourceType: formData.get("sourceType"),
    sourceUrl: formData.get("sourceUrl") || undefined,
    aiToolTag: formData.get("aiToolTag") || "",
    techStackTag: formData.get("techStackTag") || "",
    deviceType: formData.get("deviceType") || "web",
  }

  const validated = parseOrThrow(createAppSchema, raw)

  // Handle cover image upload
  let coverImage: string | null = null
  const coverImageFile = formData.get("coverImage") as File
  if (coverImageFile && coverImageFile.size > 0) {
    const buffer = Buffer.from(await coverImageFile.arrayBuffer())
    const key = `covers/${session.user.id}/${Date.now()}-${coverImageFile.name}`
    coverImage = await uploadToOSS(buffer, key, coverImageFile.type)
  }

  // Handle ZIP upload if sourceType is zip
  let playUrl: string | null = null
  let finalSourceUrl: string | null = validated.sourceUrl || null
  const zipFile = formData.get("zipFile") as File
  if (validated.sourceType === "zip" && zipFile && zipFile.size > 0) {
    const buffer = Buffer.from(await zipFile.arrayBuffer())
    const key = `uploads/${session.user.id}/${Date.now()}-${zipFile.name}`
    finalSourceUrl = await uploadToOSS(buffer, key, "application/zip")
  }

  const app = await prisma.app.create({
    data: {
      title: validated.title,
      description: validated.description || null,
      coverImage,
      sourceType: validated.sourceType,
      sourceUrl: finalSourceUrl,
      aiToolTag: validated.aiToolTag || null,
      techStackTag: validated.techStackTag || null,
      deviceType: validated.deviceType,
      authorId: session.user.id as string,
      playUrl,
    },
  })

  // Auto-deploy ZIP uploads in the background
  if (validated.sourceType === "zip" && finalSourceUrl) {
    fetch(`${process.env.NEXTAUTH_URL}/api/apps/${app.id}/deploy`, {
      method: "POST",
    }).catch((err) => {
      console.error("Auto-deploy failed:", err)
    })
  }

  revalidatePath("/apps")
  redirect(`/apps/${app.id}`)
}
