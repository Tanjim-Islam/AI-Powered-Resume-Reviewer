import { AppShell } from "@/components/app-shell";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200/80 ${className}`} />;
}

export default function AccountLoading() {
  return (
    <AppShell>
      <div
        className="container mx-auto max-w-6xl px-4 py-8 sm:py-12"
        aria-busy="true"
        aria-label="Loading profile"
      >
        <div className="mb-7 space-y-3">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-9 w-64 max-w-full" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
          <div className="overflow-hidden rounded-xl border border-white/50 bg-white/85 shadow-lg">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
              <SkeletonBlock className="size-9" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-48 max-w-full" />
              </div>
            </div>
            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <SkeletonBlock className="h-16 w-full" />
                <SkeletonBlock className="h-16 w-full" />
              </div>
              <SkeletonBlock className="h-28 w-full" />
              <SkeletonBlock className="h-28 w-full" />
              <SkeletonBlock className="h-28 w-full" />
              <div className="border-t border-gray-100 pt-5">
                <SkeletonBlock className="mb-4 h-5 w-44" />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {[0, 1, 2].map((item) => (
                    <SkeletonBlock key={item} className="h-52 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-fit overflow-hidden rounded-xl border border-white/50 bg-white/85 shadow-lg">
            <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
              <SkeletonBlock className="size-9" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-40" />
              </div>
            </div>
            <div className="space-y-4 p-5">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <SkeletonBlock className="size-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-3/4" />
                    <SkeletonBlock className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
