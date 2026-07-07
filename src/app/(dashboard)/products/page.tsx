import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ProductsClient } from "./ProductsClient"
import { prisma } from "@/lib/prisma"

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-lg">Products</h1>
          <p className="body-md">Manage your catalog, import from Excel, and update prices.</p>
        </div>
      </div>
      
      <ProductsClient isAdmin={isAdmin} />
    </div>
  )
}
