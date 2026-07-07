"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, PlusCircle, Package, Users } from "lucide-react"
import { cn } from "@/lib/utils"

export const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "New Quote", href: "/quotations/new", icon: PlusCircle },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-canvas border-t border-hairline sm:hidden">
      <div className="grid h-full grid-cols-5 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-2 hover:bg-surface-soft group",
                isActive ? "text-ink" : "text-muted"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1", isActive && "fill-current opacity-20 stroke-[1.5]", !isActive && "stroke-[1.5]")} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
