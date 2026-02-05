export default function AppLoading() {
  return (
    <main className="gradient-bg bg-background text-foreground flex min-h-screen items-center justify-center">
      <div className="border-border/60 bg-card/60 flex items-center gap-3 rounded-full border px-5 py-2 shadow-sm backdrop-blur-lg">
        <span className="bg-primary h-2.5 w-2.5 animate-pulse rounded-full" />
        <span className="text-muted-foreground text-sm font-semibold">
          Loading…
        </span>
      </div>
    </main>
  )
}
