import { CustomersClient } from "./CustomersClient"

export default function CustomersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg text-ink">Customers</h1>
          <p className="body-sm text-muted mt-1">Manage your customer directory</p>
        </div>
      </div>
      <CustomersClient />
    </div>
  )
}
