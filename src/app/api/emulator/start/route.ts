import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { appId } = body

    if (!appId || typeof appId !== "string") {
      return NextResponse.json({ error: "Missing appId" }, { status: 400 })
    }

    // Verify app exists and is a native type
    const app = await prisma.app.findUnique({
      where: { id: appId },
      select: { id: true, playUrl: true, deviceType: true, authorId: true },
    })

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    if (app.deviceType !== "android") {
      return NextResponse.json(
        { error: "Only Android apps support native emulation" },
        { status: 400 },
      )
    }

    // Dynamic import — dockerode is only needed at runtime for emulators
    const { startSession, installApk } = await import("@/lib/emulator/pool")

    // Start emulator
    const { sessionId, streamUrl } = await startSession(
      appId,
      session.user.id as string,
    )

    // If we have an APK URL, install it
    if (app.playUrl) {
      installApk(sessionId, app.playUrl).catch((err) => {
        console.error("APK install failed for session", sessionId, err)
      })
    }

    return NextResponse.json({ sessionId, streamUrl })
  } catch (error) {
    console.error("Emulator start error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to start emulator"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
