import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"
import { decryptToken } from "@/lib/encryption"
import { canEditApp } from "@/lib/permissions"

interface GitHubTreeNode {
  path: string
  type: "tree" | "blob"
  size?: number
}

interface FileTreeNode {
  name: string
  type: "file" | "dir"
  size?: number
  children?: FileTreeNode[]
}

/**
 * Fetch the file tree from a GitHub repository.
 * Uses the user's OAuth token for private repo access.
 */
async function fetchGitHubTree(repoUrl: string, token: string): Promise<FileTreeNode[]> {
  // Parse owner/repo from GitHub URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (!match) throw new Error("Invalid GitHub URL")

  const [, owner, repo] = match

  // Get default branch
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  })
  if (!repoRes.ok) throw new Error(`GitHub API error: ${repoRes.status}`)
  const repoData = await repoRes.json()
  const defaultBranch = repoData.default_branch || "main"

  // Get recursive tree (limit to src/ and root config files, max 200 items)
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
    }
  )
  if (!treeRes.ok) throw new Error(`GitHub tree API error: ${treeRes.status}`)
  const treeData = await treeRes.json()

  // Filter: only source files (exclude node_modules, .git, build output)
  const sourceFiles = (treeData.tree as GitHubTreeNode[])
    .filter((item) => {
      if (item.type !== "blob") return false
      const p = item.path
      if (p.startsWith("node_modules/") || p.startsWith(".git/")) return false
      if (p.startsWith("dist/") || p.startsWith("build/") || p.startsWith("out/")) return false
      if (p.startsWith(".next/") || p.includes("package-lock.json")) return false
      // Limit depth to avoid huge trees
      if (p.split("/").length > 8) return false
      return true
    })
    .slice(0, 200)

  // Build tree structure
  const root: FileTreeNode[] = []
  const dirMap = new Map<string, FileTreeNode>()

  for (const file of sourceFiles) {
    const parts = file.path.split("/")
    let current = root
    let currentPath = ""

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (isLast) {
        current.push({ name: part, type: "file", size: file.size })
      } else {
        let dir = dirMap.get(currentPath)
        if (!dir) {
          dir = { name: part, type: "dir", children: [] }
          dirMap.set(currentPath, dir)
          current.push(dir)
        }
        current = dir.children!
      }
    }
  }

  return root
}

export async function GET(
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
      include: { author: true },
    })

    if (!app) {
      return NextResponse.json({ error: "App not found" }, { status: 404 })
    }

    // Only the author or collaborators can access the editor
    if (!(await canEditApp(session.user.id as string, app.id))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Only GitHub source type is supported for editing
    if (app.sourceType !== "github" || !app.sourceUrl) {
      return NextResponse.json(
        { error: "Only GitHub-sourced apps support in-browser editing" },
        { status: 400 }
      )
    }

    // Decrypt the user's GitHub token
    const token = app.author.githubAccessToken
      ? decryptToken(app.author.githubAccessToken)
      : null

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token not available. Re-authenticate with repo scope." },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get("path")

    if (filePath) {
      // Fetch single file content
      const match = app.sourceUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
      if (!match) throw new Error("Invalid GitHub URL")
      const [, owner, repo] = match

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      })
      const repoData = await repoRes.json()
      const branch = repoData.default_branch || "main"

      const contentRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
        {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
        }
      )

      if (!contentRes.ok) {
        return NextResponse.json(
          { error: `File not found: ${filePath}` },
          { status: 404 }
        )
      }

      const contentData = await contentRes.json()
      const content = Buffer.from(contentData.content, "base64").toString("utf-8")

      return NextResponse.json({
        path: filePath,
        content,
        size: contentData.size,
      })
    }

    // Fetch file tree
    const tree = await fetchGitHubTree(app.sourceUrl, token)
    return NextResponse.json(tree)
  } catch (error) {
    console.error("Files API error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch files"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
