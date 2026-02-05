export default function LessonLoading() {
  return (
    <main className="bg-background text-foreground flex h-[100dvh] flex-col overflow-hidden">
      <header className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/70 fixed top-0 right-0 left-0 z-40 mx-auto flex h-14 w-full max-w-3xl items-center justify-between border-b px-4 backdrop-blur sm:h-16">
        <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
        <div className="bg-muted mx-4 h-4 flex-1 animate-pulse rounded-full sm:mx-8" />
        <div className="bg-muted h-8 w-14 animate-pulse rounded-full" />
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-3 pt-14 pb-20 sm:px-4 sm:pt-20 sm:pb-28">
        <div className="mx-auto w-full max-w-2xl space-y-6">
          <div className="bg-muted mx-auto h-8 w-4/5 animate-pulse rounded" />
          <div className="grid gap-2 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border-border bg-card h-14 w-full animate-pulse rounded-2xl border"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-border bg-background/80 supports-[backdrop-filter]:bg-background/70 fixed right-0 bottom-0 left-0 z-40 border-t p-4 pb-6 backdrop-blur sm:pb-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-primary/40 h-12 w-full animate-pulse rounded-xl" />
        </div>
      </div>
    </main>
  )
}
