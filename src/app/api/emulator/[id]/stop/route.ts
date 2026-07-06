import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stopSession } = await import("@/lib/emulator/pool")
    await stopSession(id)

    return NextResponse.json({ stopped: true })
  } catch (error) {
    console.error("Emulator stop error:", error)
    const message =
      error instanceof Error ? error.message : "Failed to stop session"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
