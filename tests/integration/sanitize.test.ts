import { describe, it, expect } from "vitest"
import { sanitizeText, sanitizeRichText } from "@/lib/sanitize"

describe("sanitizeText", () => {
  it("strips all HTML tags", () => {
    expect(sanitizeText('<script>alert("xss")</script>')).toBe("")
    expect(sanitizeText("<b>bold</b>")).toBe("bold")
    expect(sanitizeText('<a href="https://evil.com">click</a>')).toBe("click")
  })

  it("preserves plain text", () => {
    expect(sanitizeText("Hello, world!")).toBe("Hello, world!")
    expect(sanitizeText("Hello <3")).toBe("Hello &lt;3")
  })

  it("handles empty input", () => {
    expect(sanitizeText("")).toBe("")
    expect(sanitizeText("   ")).toBe("")
  })

  it("strips event handlers", () => {
    expect(sanitizeText('<img onerror="alert(1)" src=x>')).toBe("")
  })
})

describe("sanitizeRichText", () => {
  it("allows basic formatting tags", () => {
    expect(sanitizeRichText("<b>bold</b> and <i>italic</i>")).toBe(
      "<b>bold</b> and <i>italic</i>"
    )
  })

  it("allows safe links", () => {
    expect(
      sanitizeRichText('<a href="https://example.com">link</a>')
    ).toBe('<a href="https://example.com">link</a>')
  })

  it("strips dangerous tags", () => {
    expect(sanitizeRichText('<script>alert("xss")</script><b>safe</b>')).toBe(
      "<b>safe</b>"
    )
  })

  it("strips javascript: URLs", () => {
    expect(
      sanitizeRichText('<a href="javascript:alert(1)">click</a>')
    ).toBe('<a>click</a>')
  })

  it("allows code and pre tags", () => {
    expect(sanitizeRichText("<code>const x = 1</code>")).toBe(
      "<code>const x = 1</code>"
    )
  })
})
