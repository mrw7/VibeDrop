import { vi } from "vitest"

/**
 * Mock the NextAuth session for testing server actions.
 *
 * Usage in a test:
 *   vi.mock("@/lib/auth", () => mockSession({ userId: "test-user-1" }))
 */
export function mockSession(overrides: { userId?: string; name?: string } = {}) {
  return {
    auth: vi.fn().mockResolvedValue({
      user: {
        id: overrides.userId || "test-user-1",
        name: overrides.name || "Test User",
        email: "test@example.com",
        image: null,
      },
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
  }
}

/**
 * Mock no session (unauthenticated user).
 */
export function mockNoSession() {
  return {
    auth: vi.fn().mockResolvedValue(null),
    signIn: vi.fn(),
    signOut: vi.fn(),
    handlers: { GET: vi.fn(), POST: vi.fn() },
  }
}
