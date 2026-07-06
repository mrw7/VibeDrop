import sanitizeHtml from "sanitize-html"

const DEFAULT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
}

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "b", "i", "em", "strong", "a", "code", "pre", "br", "p",
    "ul", "ol", "li", "blockquote", "h1", "h2", "h3",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  disallowedTagsMode: "discard",
}

/**
 * Strip ALL HTML — returns plain text only.
 * Use for titles, tags, and other non-rich fields.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, DEFAULT_OPTIONS).trim()
}

/**
 * Allow minimal safe HTML (bold, italic, links, code).
 * Use for descriptions and comments.
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, RICH_TEXT_OPTIONS).trim()
}

/**
 * Sanitize and truncate a field.
 */
export function sanitizeAndTruncate(input: string, maxLength: number, mode: "text" | "rich" = "text"): string {
  const cleaned = mode === "rich" ? sanitizeRichText(input) : sanitizeText(input)
  return cleaned.slice(0, maxLength)
}
