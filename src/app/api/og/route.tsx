import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

type Template = "gradient" | "dark" | "minimal"

interface OGCardProps {
  title: string
  author?: string
  tool?: string
  type: string
  likes?: number
  comments?: number
  template: Template
}

// ─── Shared styles ──────────────────────────────────────────────

const BRAND_RED = "#e94560"
const BRAND_ORANGE = "#f77f00"
const BRAND_YELLOW = "#fcbf49"
const WHITE = "#ffffff"
const DARK_BG = "#0f0f1a"
const CARD_BG = "#1a1a2e"
const MUTED = "#8888a0"

function AccentBar() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        background: `linear-gradient(90deg, ${BRAND_RED}, ${BRAND_ORANGE}, ${BRAND_YELLOW})`,
      }}
    />
  )
}

function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: BRAND_RED }}>VibeDrop</div>
      {subtitle && (
        <>
          <div style={{ fontSize: 18, color: MUTED }}>—</div>
          <div style={{ fontSize: 18, color: "#c0c0d0" }}>{subtitle}</div>
        </>
      )}
    </div>
  )
}

function StatsRow({ likes, comments, author, tool, color = "#c0c0d0" }: {
  likes?: number
  comments?: number
  author?: string
  tool?: string
  color?: string
}) {
  const parts: string[] = []
  if (author) parts.push(`👤 ${author}`)
  if (tool) parts.push(`🛠 ${tool}`)
  if (likes != null) parts.push(`❤️ ${likes}`)
  if (comments != null) parts.push(`💬 ${comments}`)

  if (parts.length === 0) return null

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontSize: 20,
        color,
        marginTop: 20,
      }}
    >
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </div>
  )
}

// ─── Template: Gradient ────────────────────────────────────────

function GradientTemplate({ title, author, tool, likes, comments }: OGCardProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 80,
      }}
    >
      <Logo subtitle={tool || "分享 Vibe Coding 作品"} />
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: WHITE,
          textAlign: "center",
          maxWidth: 950,
          lineHeight: 1.15,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <StatsRow author={author} tool={tool} likes={likes} comments={comments} color="#a0a0c0" />
      <AccentBar />
    </div>
  )
}

// ─── Template: Dark Card ───────────────────────────────────────

function DarkCardTemplate({ title, author, tool, likes, comments }: OGCardProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: DARK_BG,
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 400,
          borderRadius: 20,
          overflow: "hidden",
          background: CARD_BG,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Left accent stripe */}
        <div
          style={{
            width: 10,
            background: `linear-gradient(180deg, ${BRAND_RED}, ${BRAND_ORANGE})`,
            flexShrink: 0,
          }}
        />
        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 48,
            flex: 1,
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 600, color: BRAND_RED, marginBottom: 20 }}>
            VibeDrop
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              color: WHITE,
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            {title}
          </div>
          <StatsRow author={author} tool={tool} likes={likes} comments={comments} color={MUTED} />
        </div>
      </div>
      <AccentBar />
    </div>
  )
}

// ─── Template: Minimal ─────────────────────────────────────────

function MinimalTemplate({ title, author, tool, likes, comments }: OGCardProps) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8f9fa",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#1a1a2e",
          textAlign: "center",
          maxWidth: 950,
          lineHeight: 1.2,
          marginBottom: 16,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 22, color: "#666", marginBottom: 12 }}>
        by {author || "unknown"}
        {tool ? ` · Made with ${tool}` : ""}
      </div>
      {(likes != null || comments != null) && (
        <div style={{ fontSize: 18, color: "#888", marginTop: 8 }}>
          {likes != null ? `❤️ ${likes} likes` : ""}
          {likes != null && comments != null ? " · " : ""}
          {comments != null ? `💬 ${comments} comments` : ""}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 80,
          fontSize: 22,
          fontWeight: 600,
          color: BRAND_RED,
        }}
      >
        VibeDrop
      </div>
      <AccentBar />
    </div>
  )
}

// ─── Route Handler ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const props: OGCardProps = {
      title: searchParams.get("title") || "VibeDrop",
      author: searchParams.get("author") || undefined,
      tool: searchParams.get("tool") || undefined,
      type: searchParams.get("type") || "app",
      likes: searchParams.has("likes") ? Number(searchParams.get("likes")) : undefined,
      comments: searchParams.has("comments") ? Number(searchParams.get("comments")) : undefined,
      template: (searchParams.get("template") as Template) || "gradient",
    }

    const templates: Record<Template, React.ComponentType<OGCardProps>> = {
      gradient: GradientTemplate,
      dark: DarkCardTemplate,
      minimal: MinimalTemplate,
    }

    const Component = templates[props.template] || GradientTemplate

    return new ImageResponse(<Component {...props} />, {
      width: 1200,
      height: 630,
    })
  } catch {
    return new Response("Failed to generate image", { status: 500 })
  }
}
