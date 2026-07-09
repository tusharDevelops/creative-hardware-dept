"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FileText, Package, Users, ShoppingCart, IndianRupee } from "lucide-react"
import { cn } from "@/lib/utils"

export const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Sales", href: "/sales", icon: IndianRupee },
  { name: "Quotations", href: "/quotations", icon: FileText },
  { name: "Purchases", href: "/purchases", icon: ShoppingCart },
  { name: "Products", href: "/products", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-canvas border-t border-hairline sm:hidden overflow-x-auto custom-scrollbar">
      <div className="flex h-full min-w-max px-2 font-medium">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex flex-col items-center justify-center px-4 hover:bg-surface-soft group min-w-[70px]",
                isActive ? "text-ink" : "text-muted"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-1 shrink-0", isActive && "fill-current opacity-20 stroke-[1.5]", !isActive && "stroke-[1.5]")} />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
