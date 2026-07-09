import { PurchasesClient } from "./PurchasesClient"

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-lg">Purchases</h1>
          <p className="body-md">View and manage your purchase history.</p>
        </div>
      </div>
      
      <PurchasesClient />
    </div>
  )
}
