import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl w-full">
          <Skeleton className="h-12 w-3/4 max-w-md rounded-[var(--radius-lg)]" />
          <Skeleton className="h-16 w-full rounded-[var(--radius-lg)]" />
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Skeleton className="h-[64px] flex-1 rounded-[var(--radius-lg)]" />
            <Skeleton className="h-[64px] w-full sm:w-32 rounded-[var(--radius-lg)]" />
          </div>
        </div>
        <div className="hidden md:block">
          <Skeleton className="h-12 w-48 rounded-[var(--radius-lg)]" />
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <Skeleton className="h-8 w-32 mb-4 rounded-[var(--radius-md)]" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-none bg-surface-card rounded-[var(--radius-lg)]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-5 w-24 rounded-[var(--radius-md)]" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-16 rounded-[var(--radius-md)]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions / Recent */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-48 rounded-[var(--radius-md)]" />
            <Skeleton className="h-5 w-16 rounded-[var(--radius-md)]" />
          </div>
          <Card className="border border-hairline shadow-none bg-canvas rounded-[var(--radius-lg)]">
            <CardContent className="p-0">
              <div className="divide-y divide-hairline">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-[var(--radius-sm)]" />
                      <Skeleton className="h-3 w-24 rounded-[var(--radius-sm)]" />
                    </div>
                    <div className="space-y-2 flex flex-col items-end">
                      <Skeleton className="h-4 w-20 rounded-[var(--radius-sm)]" />
                      <Skeleton className="h-3 w-16 rounded-[var(--radius-sm)]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Skeleton className="h-8 w-32 mb-4 rounded-[var(--radius-md)]" />
          <div className="grid gap-3">
            {[1, 2].map((i) => (
              <Card key={i} className="border border-hairline shadow-none bg-canvas rounded-[var(--radius-lg)]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32 rounded-[var(--radius-sm)]" />
                      <Skeleton className="h-4 w-48 rounded-[var(--radius-sm)]" />
                    </div>
                  </div>
                  <Skeleton className="w-4 h-4 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
