import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
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
      include: {
        builds: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
    })

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    const latestBuild = app.builds[0]

    return NextResponse.json({
      buildStatus: app.buildStatus,
      buildId: app.buildId,
      latestBuild: latestBuild
        ? {
            id: latestBuild.id,
            status: latestBuild.status,
            buildLog: latestBuild.buildLog,
            artifactUrl: latestBuild.artifactUrl,
            startedAt: latestBuild.startedAt,
            completedAt: latestBuild.completedAt,
          }
        : null,
      playUrl: app.playUrl,
    })
  } catch (error) {
    console.error("Failed to fetch build status:", error)
    return NextResponse.json(
      { error: "Failed to fetch build status" },
      { status: 500 }
    )
  }
}
