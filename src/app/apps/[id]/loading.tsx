import Header from "@/components/Header"

export default function AppDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Phone skeleton */}
          <div className="flex flex-col items-center">
            <div className="w-[320px] h-[650px] bg-card border-2 border-border rounded-[2.5rem] animate-pulse" />
          </div>

          {/* Info skeleton */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="h-7 bg-muted rounded-md w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
              <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse" />
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded-md w-24 animate-pulse" />
                  <div className="h-3 bg-muted rounded-md w-16 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
                <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="h-6 bg-muted rounded-md w-16 mb-4 animate-pulse" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded-md w-20 animate-pulse" />
                      <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
