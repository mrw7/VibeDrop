import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { canEditApp } from "@/lib/permissions"
import EditorShell from "./EditorShell"

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const app = await prisma.app.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      authorId: true,
      sourceType: true,
      sourceUrl: true,
    },
  })

  if (!app) {
    notFound()
  }

  // Only the author or collaborators can access the editor
  if (!(await canEditApp(session.user.id as string, app.id))) {
    redirect(`/apps/${app.id}`)
  }

  // Only GitHub source is supported for now
  if (app.sourceType !== "github") {
    redirect(`/apps/${app.id}`)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/apps/${app.id}`}>
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
          </Button>
          <span className="text-sm font-medium text-foreground truncate max-w-[400px]">
            Editing: {app.title}
          </span>
        </div>
      </header>

      {/* Editor Shell (client component) */}
      <EditorShell appId={app.id} />
    </div>
  )
}
