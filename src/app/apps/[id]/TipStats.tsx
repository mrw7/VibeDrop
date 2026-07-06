interface TipStatsProps {
  tipsCount: number
  tipsTotal: number
}

function formatYuan(cents: number): string {
  return (cents / 100).toFixed(2)
}

export default function TipStats({ tipsCount, tipsTotal }: TipStatsProps) {
  if (tipsCount === 0) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>
        已收到 {tipsCount} 次打赏 · 共 ¥{formatYuan(tipsTotal)}
      </span>
    </div>
  )
}
