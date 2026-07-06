import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { uploadToOSS, getOSSUrl } from "@/lib/oss"
import { unzipSync } from "fflate"
import path from "path"
import { canEditApp } from "@/lib/permissions"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // CSRF: validate origin in production
    if (process.env.NODE_ENV === "production") {
      const origin = request.headers.get("origin")
      const allowedOrigin = process.env.NEXTAUTH_URL || ""
      if (!origin || new URL(origin).origin !== new URL(allowedOrigin).origin) {
        return NextResponse.json({ error: "Invalid Origin", code: "CSRF_REJECTED" }, { status: 403 })
      }
    }

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

    // For ZIP uploads, extract and host static files
    if (app.sourceType === "zip" && app.sourceUrl) {
      // Download ZIP from OSS
      const zipResponse = await fetch(app.sourceUrl)
      if (!zipResponse.ok) {
        throw new Error("Failed to download ZIP file")
      }

      const zipBuffer = Buffer.from(await zipResponse.arrayBuffer())
      const files = unzipSync(zipBuffer)

      // Find index.html and upload all files
      let indexPath: string | null = null
      const uploadPromises: Promise<void>[] = []
      const baseKey = `apps/${app.id}/static`

      for (const [filePath, fileData] of Object.entries(files)) {
        if (fileData.length === 0) continue // Skip directories

        const normalizedPath = filePath.replace(/^[^/]+\//, "") // Remove top-level directory
        const ossKey = `${baseKey}/${normalizedPath}`

        // Determine content type
        const ext = path.extname(normalizedPath).toLowerCase()
        const contentTypeMap: Record<string, string> = {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".gif": "image/gif",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
          ".woff": "font/woff",
          ".woff2": "font/woff2",
          ".ttf": "font/ttf",
        }
        const contentType = contentTypeMap[ext] || "application/octet-stream"

        uploadPromises.push(
          uploadToOSS(Buffer.from(fileData), ossKey, contentType).then(() => {
            if (normalizedPath === "index.html" || normalizedPath.endsWith("/index.html")) {
              indexPath = ossKey
            }
          })
        )
      }

      await Promise.all(uploadPromises)

      if (!indexPath) {
        // Fallback: find any HTML file
        for (const [filePath] of Object.entries(files)) {
          if (filePath.endsWith(".html")) {
            const normalizedPath = filePath.replace(/^[^/]+\//, "")
            indexPath = `${baseKey}/${normalizedPath}`
            break
          }
        }
      }

      if (!indexPath) {
        throw new Error("No index.html found in ZIP")
      }

      const playUrl = getOSSUrl(indexPath)

      // Update app with playUrl
      await prisma.app.update({
        where: { id: app.id },
        data: {
          playUrl,
          buildStatus: "success",
        },
      })

      return NextResponse.json({
        success: true,
        playUrl,
        message: "ZIP extracted and hosted successfully",
      })
    }

    return NextResponse.json({ error: "Not a ZIP upload" }, { status: 400 })
  } catch (error) {
    console.error("Deploy failed:", error)
    return NextResponse.json(
      { error: "Deploy failed", details: (error as Error).message },
      { status: 500 }
    )
  }
}
