import { NewSaleClient } from "./NewSaleClient"

export default function NewSalePage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg">New Sale</h1>
        </div>
      </div>
      <NewSaleClient />
    </div>
  )
}
