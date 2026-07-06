import Header from "@/components/Header"

function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden break-inside-avoid">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-muted rounded-md w-3/4 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-2/3 animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
            <div className="h-3 bg-muted rounded-md w-16 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 bg-muted rounded-md w-12 animate-pulse" />
            <div className="h-5 bg-muted rounded-md w-14 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded-md w-32 mb-6 animate-pulse" />
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-11 bg-muted rounded-lg animate-pulse" />
            <div className="flex gap-2">
              <div className="h-11 w-36 bg-muted rounded-lg animate-pulse" />
              <div className="h-11 w-36 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </main>
    </div>
  )
}
