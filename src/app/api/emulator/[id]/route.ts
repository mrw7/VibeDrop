import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { getSession } = await import("@/lib/emulator/pool")
    const emulatorSession = await getSession(id)
    if (!emulatorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(emulatorSession)
  } catch (error) {
    console.error("Emulator status error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to get session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
