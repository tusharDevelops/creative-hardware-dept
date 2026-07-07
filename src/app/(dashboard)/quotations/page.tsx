import { QuotationsClient } from "./QuotationsClient"

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="display-lg">Quotations</h1>
          <p className="body-md">View and manage your quotation history.</p>
        </div>
      </div>
      
      <QuotationsClient />
    </div>
  )
}
