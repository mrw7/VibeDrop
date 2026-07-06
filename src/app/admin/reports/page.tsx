import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, ExternalLink, CheckCircle, Trash2 } from "lucide-react"
import { resolveReport, deleteReport } from "./actions"

const ADMIN_IDS = process.env.ADMIN_GITHUB_IDS?.split(",") || []

export default async function AdminReportsPage() {
  const session = await auth()

  // Simple admin check — configure ADMIN_GITHUB_IDS in .env
  if (!session?.user || !ADMIN_IDS.includes(session.user.id as string)) {
    redirect("/auth/signin")
  }

  const reports = await prisma.report.findMany({
    include: {
      app: { select: { id: true, title: true } },
      reporter: { select: { id: true, githubLogin: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const unresolved = reports.filter((r) => !r.resolved)
  const resolved = reports.filter((r) => r.resolved)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Flag className="w-6 h-6 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">举报管理</h1>
          <Badge variant="destructive">{unresolved.length} 未处理</Badge>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">暂无举报</div>
        ) : (
          <div className="space-y-4">
            {[...unresolved, ...resolved].map((report) => (
              <div
                key={report.id}
                className={`bg-card border rounded-xl p-4 ${
                  report.resolved ? "border-border opacity-60" : "border-destructive/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/apps/${report.app.id}`}
                        className="font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {report.app.title}
                      </Link>
                      {report.resolved ? (
                        <Badge variant="secondary">已处理</Badge>
                      ) : (
                        <Badge variant="destructive">待处理</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{report.reason}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>举报人: {report.reporter.githubLogin}</span>
                      <span>{report.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!report.resolved && (
                      <form action={resolveReport.bind(null, report.id)}>
                        <Button variant="outline" size="sm" type="submit">
                          <CheckCircle className="w-3 h-3" />
                          标记已处理
                        </Button>
                      </form>
                    )}
                    <form action={deleteReport.bind(null, report.id)}>
                      <Button variant="outline" size="sm" type="submit">
                        <Trash2 className="w-3 h-3" />
                        删除
                      </Button>
                    </form>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/apps/${report.app.id}`}>
                        <ExternalLink className="w-3 h-3" />
                        查看
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
