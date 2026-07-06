import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { uploadToOSS } from "@/lib/oss"
import { zipSync } from "fflate"
import { canEditApp } from "@/lib/permissions"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const app = await prisma.app.findUnique({
      where: { id },
    })

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    if (!(await canEditApp(session.user.id as string, app.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const files = body.files as Record<string, string> | undefined

    if (!files || Object.keys(files).length === 0) {
      return NextResponse.json({ error: "No files to save" }, { status: 400 })
    }

    // Validate file paths (prevent path traversal)
    for (const filePath of Object.keys(files)) {
      if (filePath.includes("..") || filePath.startsWith("/")) {
        return NextResponse.json(
          { error: `Invalid file path: ${filePath}` },
          { status: 400 }
        )
      }
      if (files[filePath].length > 1_000_000) {
        return NextResponse.json(
          { error: `File too large: ${filePath} (max 1MB)` },
          { status: 400 }
        )
      }
    }

    // Create ZIP from modified files
    const zipData: Record<string, Uint8Array> = {}
    for (const [filePath, content] of Object.entries(files)) {
      zipData[filePath] = new TextEncoder().encode(content)
    }
    const zipBuffer = Buffer.from(zipSync(zipData))

    // Upload modified sources to OSS
    const zipKey = `sources/${session.user.id}/${Date.now()}-modified.zip`
    const sourceUrl = await uploadToOSS(zipBuffer, zipKey, "application/zip")

    // Create a pending Build with the modified source
    const build = await prisma.build.create({
      data: {
        appId: app.id,
        status: "pending",
        sourceType: "zip",
        sourceUrl,
      },
    })

    // Update app to pending build
    await prisma.app.update({
      where: { id: app.id },
      data: {
        buildStatus: "pending",
        buildId: build.id,
        sourceUrl: sourceUrl, // Update source to the modified version
      },
    })

    return NextResponse.json({
      buildId: build.id,
      status: "pending",
      filesCount: Object.keys(files).length,
    })
  } catch (error) {
    console.error("Save API error:", error)
    const message = error instanceof Error ? error.message : "Failed to save files"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
