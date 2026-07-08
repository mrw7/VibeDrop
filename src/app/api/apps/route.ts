import { auth } from "@/lib/auth"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { validateOrigin } from "@/lib/csrf"
import { parseOrThrow, createAppSchema, AppError } from "@/lib/validations"

export async function POST(request: NextRequest) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 })
    }

    const body = await request.json()

    // Validate through Zod + sanitize-html
    const validated = parseOrThrow(createAppSchema, {
      title: body.title,
      description: body.description || "",
      sourceType: body.sourceType,
      sourceUrl: body.sourceUrl,
      aiToolTag: body.aiToolTag || "",
      techStackTag: body.techStackTag || "",
      deviceType: body.deviceType || "web",
    })

    const app = await prisma.app.create({
      data: {
        title: validated.title,
        description: validated.description || null,
        sourceType: validated.sourceType,
        sourceUrl: validated.sourceUrl || null,
        aiToolTag: validated.aiToolTag || null,
        techStackTag: validated.techStackTag || null,
        deviceType: validated.deviceType,
        authorId: session.user.id as string,
      },
    })

    return NextResponse.json(app, { status: 201 })
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      )
    }
    console.error("Failed to create app:", error)
    return NextResponse.json(
      { error: "Failed to create app", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const apps = await prisma.app.findMany({
      include: {
        author: {
          select: {
            id: true,
            githubLogin: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(apps)
  } catch (error) {
    console.error("Failed to fetch apps:", error)
    return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 })
  }
}
