import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

// sitemap must be dynamic — Prisma queries at build-time would need a real DB,
// which isn't available in the Docker build (dummy env vars only).
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/apps`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/auth/signin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ]

  // Dynamic app pages
  const apps = await prisma.app.findMany({
    select: { id: true, updatedAt: true },
    where: { buildStatus: "success" },
  })

  const appRoutes: MetadataRoute.Sitemap = apps.map((app) => ({
    url: `${baseUrl}/apps/${app.id}`,
    lastModified: app.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Dynamic user pages
  const users = await prisma.user.findMany({
    select: { id: true },
  })

  const userRoutes: MetadataRoute.Sitemap = users.map((user) => ({
    url: `${baseUrl}/users/${user.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }))

  return [...staticRoutes, ...appRoutes, ...userRoutes]
}
