import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Package, Users, PlusCircle, MapPin, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function Dashboard() {
  // Fetch real data from the database
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalProducts, totalCustomers, todaysQuotes, recentQuotations] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.customer.count(),
    prisma.quotation.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),
    prisma.quotation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    })
  ])

  const stats = [
    { name: "Today's Quotes", value: todaysQuotes.toString(), icon: FileText },
    { name: "Total Products", value: totalProducts.toLocaleString(), icon: Package },
    { name: "Total Customers", value: totalCustomers.toLocaleString(), icon: Users },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          <h1 className="display-lg text-ink tracking-tight">
            Hardware Department
          </h1>
          <p className="body-lg text-muted">
            Manage quotations, product catalog, and customer details for Creative Interiors. Fast, reliable, and professional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex items-start gap-2 p-3 bg-surface-card rounded-[var(--radius-lg)] flex-1">
              <MapPin className="w-5 h-5 text-muted mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-ink">G.D Tower</p>
                <p className="text-[13px] text-muted-soft leading-tight mt-0.5">
                  Khermai Road, Shop NO-1<br />
                  Satna, Madhya Pradesh 485001
                </p>
              </div>
            </div>
            <a 
              href="https://share.google/AseY9LiOA59auVQu2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button variant="outline" className="w-full sm:w-auto h-full min-h-[64px]">
                View on Map <ExternalLink className="w-4 h-4 ml-2 text-muted" />
              </Button>
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <Link href="/quotations/new">
            <Button size="lg" className="h-12 px-8">
              New Quotation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div>
        <h2 className="title-md mb-4 text-ink">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.name} className="border-none shadow-none bg-surface-card rounded-[var(--radius-lg)]">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="title-sm text-muted">{stat.name}</CardTitle>
                  <Icon className="w-4 h-4 text-muted-soft" />
                </CardHeader>
                <CardContent>
                  <div className="display-sm text-ink">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Quick Actions / Recent */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-md text-ink">Recent Quotations</h2>
            <Link href="/quotations" className="text-sm font-medium text-muted hover:text-ink transition-colors">
              View all
            </Link>
          </div>
          <Card className="border border-hairline shadow-none bg-canvas rounded-[var(--radius-lg)]">
            <CardContent className="p-0">
              {recentQuotations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                  <FileText className="w-8 h-8 text-muted-soft mb-3" />
                  <p className="text-sm text-muted font-medium">No recent quotations found.</p>
                  <p className="text-[13px] text-muted-soft mt-1">Create your first quote to see it here.</p>
                </div>
              ) : (
                <div className="divide-y divide-hairline">
                  {recentQuotations.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-4 hover:bg-surface-soft transition-colors">
                      <div>
                        <p className="text-[13px] font-semibold text-ink">{quote.quotationNumber}</p>
                        <p className="text-[12px] text-muted">{quote.customer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-medium text-ink">₹{quote.grandTotal.toLocaleString()}</p>
                        <p className="text-[11px] text-muted-soft">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h2 className="title-md mb-4 text-ink">Quick Links</h2>
          <div className="grid gap-3">
            <Link href="/quotations/new">
              <Card className="border border-hairline shadow-none bg-canvas hover:bg-surface-soft transition-colors cursor-pointer rounded-[var(--radius-lg)]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-dark/5 flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink">Create Quotation</h3>
                      <p className="text-[13px] text-muted">Generate a new PDF quote instantly</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-soft" />
                </CardContent>
              </Card>
            </Link>
            <Link href="/products">
              <Card className="border border-hairline shadow-none bg-canvas hover:bg-surface-soft transition-colors cursor-pointer rounded-[var(--radius-lg)]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-dark/5 flex items-center justify-center">
                      <Package className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-ink">Manage Products</h3>
                      <p className="text-[13px] text-muted">Update catalog and pricing</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-soft" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-20 right-4 md:hidden z-50">
        <Link href="/quotations/new">
          <Button size="icon" className="w-[56px] h-[56px] rounded-full shadow-xl bg-ink text-canvas active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
