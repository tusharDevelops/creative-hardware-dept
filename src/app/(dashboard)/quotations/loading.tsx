import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function QuotationsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-5 w-64 rounded-[var(--radius-md)]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[var(--radius-md)]" />
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Skeleton className="h-10 w-full sm:w-[300px] rounded-[var(--radius-md)]" />
        <Skeleton className="h-10 w-[100px] rounded-[var(--radius-md)] hidden sm:block" />
      </div>

      {/* Table Skeleton */}
      <Card className="border-none shadow-none bg-surface-card rounded-[var(--radius-lg)]">
        <CardContent className="p-0">
          <div className="border-b border-hairline p-4 hidden sm:grid grid-cols-4 gap-4">
            <Skeleton className="h-4 w-24 rounded-[var(--radius-sm)]" />
            <Skeleton className="h-4 w-32 rounded-[var(--radius-sm)]" />
            <Skeleton className="h-4 w-20 rounded-[var(--radius-sm)] justify-self-end" />
            <Skeleton className="h-4 w-12 rounded-[var(--radius-sm)] justify-self-end" />
          </div>
          <div className="divide-y divide-hairline">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 sm:grid sm:grid-cols-4 gap-4 items-center flex flex-col sm:flex-row space-y-4 sm:space-y-0">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-3/4 rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-4 w-1/2 rounded-[var(--radius-sm)]" />
                </div>
                <div className="space-y-2 w-full hidden sm:block">
                  <Skeleton className="h-5 w-32 rounded-[var(--radius-sm)]" />
                </div>
                <Skeleton className="h-5 w-24 rounded-[var(--radius-sm)] sm:justify-self-end" />
                <Skeleton className="h-8 w-8 rounded-full ml-auto hidden sm:block justify-self-end" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
