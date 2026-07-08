import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [] })
    }

    if (q.length > 100) {
      return NextResponse.json({ error: "查询过长" }, { status: 400 })
    }

    // Search by name or githubLogin
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { githubLogin: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        githubLogin: true,
        image: true,
      },
      take: 10,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("User search API error:", error)
    return NextResponse.json({ error: "搜索失败" }, { status: 500 })
  }
}
