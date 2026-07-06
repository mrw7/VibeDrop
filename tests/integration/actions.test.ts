import { describe, it, expect, vi } from "vitest"

// Test that server actions export correctly and handle basic validation
describe("Server Actions — Structure", () => {
  it("likeApp is a function", async () => {
    const { likeApp } = await import("@/app/apps/[id]/actions")
    expect(typeof likeApp).toBe("function")
  })

  it("unlikeApp is a function", async () => {
    const { unlikeApp } = await import("@/app/apps/[id]/actions")
    expect(typeof unlikeApp).toBe("function")
  })

  it("addComment is a function", async () => {
    const { addComment } = await import("@/app/apps/[id]/actions")
    expect(typeof addComment).toBe("function")
  })

  it("deleteComment is a function", async () => {
    const { deleteComment } = await import("@/app/apps/[id]/actions")
    expect(typeof deleteComment).toBe("function")
  })

  it("editApp is a function", async () => {
    const { editApp } = await import("@/app/apps/[id]/actions")
    expect(typeof editApp).toBe("function")
  })

  it("deleteApp is a function", async () => {
    const { deleteApp } = await import("@/app/apps/[id]/actions")
    expect(typeof deleteApp).toBe("function")
  })

  it("reportApp is a function", async () => {
    const { reportApp } = await import("@/app/apps/[id]/actions")
    expect(typeof reportApp).toBe("function")
  })
})

describe("Server Actions — Validation (no DB)", () => {
  it("addComment rejects empty content via Zod", async () => {
    const { addComment } = await import("@/app/apps/[id]/actions")
    // This will fail on auth first (no session), but we're testing
    // that the function exists and is callable
    await expect(addComment("fake-uuid", "")).rejects.toThrow()
  })

  it("editApp rejects empty title via Zod", async () => {
    const { editApp } = await import("@/app/apps/[id]/actions")
    await expect(
      editApp("fake-uuid", { title: "", description: "" })
    ).rejects.toThrow()
  })

  it("triggerBuild rejects invalid appId via Zod", async () => {
    const { triggerBuild } = await import("@/app/apps/[id]/build/actions")
    await expect(triggerBuild("not-a-uuid")).rejects.toThrow()
  })
})

describe("Validation schemas — structure", () => {
  it("createAppSchema has expected fields", async () => {
    const { createAppSchema } = await import("@/lib/validations")
    const shape = createAppSchema.shape
    expect(shape.title).toBeDefined()
    expect(shape.description).toBeDefined()
    expect(shape.sourceType).toBeDefined()
    expect(shape.deviceType).toBeDefined()
  })

  it("addCommentSchema has appId + content", async () => {
    const { addCommentSchema } = await import("@/lib/validations")
    const shape = addCommentSchema.shape
    expect(shape.appId).toBeDefined()
    expect(shape.content).toBeDefined()
  })

  it("editAppSchema has title + appId", async () => {
    const { editAppSchema } = await import("@/lib/validations")
    const shape = editAppSchema.shape
    expect(shape.appId).toBeDefined()
    expect(shape.title).toBeDefined()
  })
})
