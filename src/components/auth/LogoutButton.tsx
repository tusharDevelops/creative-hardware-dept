"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
export function LogoutButton({ variant = "ghost", className }: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link", className?: string }) {
  return (
    <button 
      className={`flex items-center justify-center bg-transparent transition-colors ${className || ""}`} 
      onClick={(e) => {
        e.preventDefault();
        console.log("Signing out...");
        signOut({ callbackUrl: '/login' });
      }}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </button>
  )
}
