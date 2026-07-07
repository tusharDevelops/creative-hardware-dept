"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems } from "./BottomNav"
import Image from "next/image"

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-800 hidden sm:block">
      <div className="h-full px-3 py-4 overflow-y-auto">
        <div className="flex items-center justify-center mb-8 mt-2">
          <Image src="/logo4-min.png" alt="Logo" width={140} height={45} className="dark:hidden object-contain" />
          <Image src="/logo3-min.png" alt="Logo" width={140} height={45} className="hidden dark:block object-contain" />
        </div>
        <ul className="space-y-2 font-medium">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg group",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition duration-75",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                    )}
                  />
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
