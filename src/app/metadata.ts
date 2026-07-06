import { type Metadata } from "next"

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: {
    default: "VibeDrop - 分享你的 Vibe Coding 作品",
    template: "%s | VibeDrop",
  },
  description: "VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台。上传你的 AI 生成应用，让全世界即时体验。",
  keywords: ["vibe coding", "AI", "app", "share", "community", "Cursor", "v0", "Bolt", "Lovable"],
  authors: [{ name: "VibeDrop Team" }],
  openGraph: {
    title: "VibeDrop - 分享你的 Vibe Coding 作品",
    description: "VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/api/og?type=home&template=gradient`,
        width: 1200,
        height: 630,
        alt: "VibeDrop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeDrop - 分享你的 Vibe Coding 作品",
    description: "VibeDrop 是一个面向 Vibe Coding 社区的 App 分享与试玩平台",
    images: [`${BASE_URL}/api/og?type=home&template=gradient`],
  },
}
