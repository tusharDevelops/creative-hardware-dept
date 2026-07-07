import { BottomNav } from "@/components/layout/BottomNav"
import { LogoutButton } from "@/components/auth/LogoutButton"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Top Navigation Desktop */}
      <header className="hidden sm:flex items-center justify-between h-[64px] px-8 bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo4-min.png" alt="Creative Interiors" className="h-10 w-auto object-contain" />
        </div>
        <nav className="flex items-center gap-6">
          <a href="/" className="nav-link text-ink">Dashboard</a>
          <a href="/quotations" className="nav-link text-ink">Quotations</a>
          <a href="/products" className="nav-link text-ink">Products</a>
          <a href="/customers" className="nav-link text-ink">Customers</a>
          <div className="w-px h-4 bg-surface-soft mx-2" />
          <LogoutButton variant="ghost" className="text-muted hover:text-ink" />
        </nav>
      </header>

      {/* Mobile Top Bar */}
      <header className="sm:hidden flex items-center justify-between h-[64px] px-4 bg-canvas border-b border-hairline sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo4-min.png" alt="Creative Interiors" className="h-8 w-auto object-contain" />
        </div>
        <LogoutButton variant="ghost" className="text-muted w-10 h-10 p-0 [&>span]:hidden [&>svg]:mr-0" />
      </header>

      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto">
        <main className="flex-1 py-[96px] px-4 md:px-8">
          {children}
        </main>
      </div>

      {/* Dark Footer */}
      <footer className="bg-surface-dark text-on-dark-soft py-16 px-4 md:px-8 mt-auto sm:mb-0 mb-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo4-min.png" alt="Creative Interiors" className="h-8 w-auto object-contain grayscale invert opacity-90" />
            </div>
            <p className="body-sm text-on-dark-soft max-w-xs">
              The better way to schedule your quotations. Fast, reliable, and professional.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-16">
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-canvas text-sm">Product</h4>
              <a href="/quotations/new" className="text-sm hover:text-canvas transition-colors">New Quote</a>
              <a href="/products" className="text-sm hover:text-canvas transition-colors">Catalog</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-canvas text-sm">Company</h4>
              <a href="#" className="text-sm hover:text-canvas transition-colors">Settings</a>
              <a href="#" className="text-sm hover:text-canvas transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}
