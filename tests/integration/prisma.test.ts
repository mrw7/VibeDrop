import { describe, it, expect } from "vitest"

// Prisma client import — works if DATABASE_URL is set
// If the DB isn't available, this test will be skipped

describe("Prisma Client", () => {
  it("should have DATABASE_URL configured", () => {
    expect(process.env.DATABASE_URL).toBeDefined()
    expect(process.env.DATABASE_URL).toContain("postgresql")
  })

  it("should be able to connect to the database", async () => {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, skipping DB connection test")
      return
    }

    const { prisma } = await import("@/lib/prisma")

    // Simple query — just verify connection works
    const userCount = await prisma.user.count()
    expect(typeof userCount).toBe("number")
  })

  it("should have env vars for OSS", () => {
    expect(process.env.OSS_REGION).toBeDefined()
    expect(process.env.OSS_BUCKET).toBeDefined()
  })
})
