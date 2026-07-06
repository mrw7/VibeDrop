"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

const AI_TOOLS = [
  { value: "", label: "所有 AI 工具" },
  { value: "Cursor", label: "Cursor" },
  { value: "v0", label: "v0" },
  { value: "Bolt", label: "Bolt" },
  { value: "Lovable", label: "Lovable" },
]

const TECH_STACKS = [
  { value: "", label: "所有技术栈" },
  { value: "React", label: "React" },
  { value: "Vue", label: "Vue" },
  { value: "Flutter", label: "Flutter" },
  { value: "Vanilla", label: "Vanilla" },
]

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentAiTool = searchParams.get("aiTool") || ""
  const currentTechStack = searchParams.get("techStack") || ""

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("offset") // reset pagination on filter change
      router.push(`/apps?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="flex gap-2">
      <select
        name="aiTool"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all"
        value={currentAiTool}
        onChange={(e) => updateFilter("aiTool", e.target.value)}
      >
        {AI_TOOLS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <select
        name="techStack"
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring transition-all"
        value={currentTechStack}
        onChange={(e) => updateFilter("techStack", e.target.value)}
      >
        {TECH_STACKS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  )
}
