import { SalesClient } from "./SalesClient"

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-lg">Sales</h1>
          <p className="body-md">View and manage your sale history.</p>
        </div>
      </div>
      
      <SalesClient />
    </div>
  )
}
