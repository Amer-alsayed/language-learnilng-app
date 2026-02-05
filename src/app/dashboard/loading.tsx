export default function DashboardLoading() {
  return (
    <main className="gradient-bg bg-background text-foreground min-h-screen pb-24">
      <div className="sticky top-0 z-20 w-full px-4 pt-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
          <div className="border-border/60 bg-card/60 h-10 w-64 animate-pulse rounded-full border shadow-sm backdrop-blur-lg" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pt-6">
        <div className="flex flex-col gap-16 pb-24">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="mb-10 w-full px-2 sm:px-0">
                <div className="border-border/60 bg-card/70 mx-auto max-w-md rounded-3xl border p-5 shadow-sm backdrop-blur-lg">
                  <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                  <div className="bg-muted mt-3 h-6 w-48 animate-pulse rounded" />
                  <div className="bg-muted mt-2 h-4 w-full animate-pulse rounded" />
                  <div className="bg-muted mt-2 h-4 w-5/6 animate-pulse rounded" />
                  <div className="bg-muted mt-5 h-2 w-full overflow-hidden rounded-full">
                    <div className="bg-primary/40 h-full w-1/3 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="flex w-full max-w-md flex-col items-center gap-6">
                {Array.from({ length: 5 }).map((__, i) => (
                  <div
                    key={i}
                    className="border-border bg-card h-20 w-20 animate-pulse rounded-full border shadow-sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
