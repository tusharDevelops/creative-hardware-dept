import { NewQuoteClient } from "./NewQuoteClient"

export default function NewQuotePage() {
  return (
    <div className="space-y-4 max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display-lg">New Quotation</h1>
        </div>
      </div>
      <NewQuoteClient />
    </div>
  )
}
