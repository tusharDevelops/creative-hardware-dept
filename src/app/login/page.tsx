"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        mobile,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error("Invalid credentials")
      } else {
        toast.success("Logged in successfully")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <Card className="w-full max-w-sm border-none shadow-none bg-surface-card rounded-[var(--radius-lg)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Image src="/logo4-min.png" alt="Creative Interiors Logo" width={180} height={60} className="object-contain" priority />
          </div>
          <CardTitle className="display-sm text-ink text-[24px]">Welcome Back</CardTitle>
          <CardDescription className="body-sm text-muted-soft mt-2">Enter your mobile number and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="mobile" className="text-[13px] font-medium text-muted">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="e.g. 9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-medium text-muted">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>
            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
