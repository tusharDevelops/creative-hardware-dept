"use client"

import { useState, useEffect, useCallback, useRef, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, FileText, User, Phone, MapPin, Hash } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [customer, setCustomer] = useState<any>(null)
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuotes, setTotalQuotes] = useState(0)

  const fetchCustomer = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/customers/${id}?page=${pageNum}&limit=10`)
      const json = await res.json()
      setCustomer(json.customer)
      setQuotations(json.quotations?.data || [])
      setTotalPages(json.quotations?.totalPages || 1)
      setTotalQuotes(json.quotations?.total || 0)
    } catch {
      toast.error("Failed to load customer")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchCustomer(page)
  }, [page, fetchCustomer])

  const handleDownloadPdf = async (quoteId: string, number: string) => {
    toast.loading("Generating PDF...")
    try {
      const res = await fetch(`/api/quotations/${quoteId}/pdf`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.dismiss()
      toast.success("PDF Downloaded")
    } catch {
      toast.dismiss()
      toast.error("Failed to generate PDF")
    }
  }

  if (loading && !customer) {
    return <div className="text-center p-12 text-muted">Loading customer...</div>
  }

  if (!customer) {
    return <div className="text-center p-12 text-muted">Customer not found</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="display-lg text-ink">{customer.name}</h1>
          <p className="body-sm text-muted mt-1">Customer details and quotation history</p>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card className="border-none shadow-none bg-surface-card rounded-[var(--radius-lg)]">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center border border-hairline">
                <User className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[12px] text-muted-soft uppercase font-semibold">Name</p>
                <p className="text-[14px] font-medium text-ink">{customer.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center border border-hairline">
                <Phone className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[12px] text-muted-soft uppercase font-semibold">Mobile</p>
                <p className="text-[14px] font-medium text-ink">{customer.mobile}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center border border-hairline">
                <MapPin className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[12px] text-muted-soft uppercase font-semibold">Address</p>
                <p className="text-[14px] font-medium text-ink">{customer.address || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-canvas flex items-center justify-center border border-hairline">
                <Hash className="w-5 h-5 text-ink" />
              </div>
              <div>
                <p className="text-[12px] text-muted-soft uppercase font-semibold">GST</p>
                <p className="text-[14px] font-medium text-ink">{customer.gstNumber || "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotation History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="title-md text-ink">Quotation History ({totalQuotes})</h2>
          <Link href="/quotations/new">
            <Button size="sm">
              New Quote
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {quotations.length === 0 ? (
            <Card className="border border-hairline shadow-none bg-canvas rounded-[var(--radius-lg)]">
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                  <FileText className="w-8 h-8 text-muted-soft mb-3" />
                  <p className="text-sm text-muted font-medium">No quotations for this customer yet.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            quotations.map((quote) => (
              <Card key={quote.id} className="border-none bg-surface-card rounded-[var(--radius-lg)] shadow-none">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-canvas text-ink p-3 rounded-[var(--radius-md)] hidden sm:block border border-hairline">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="title-sm text-ink">{quote.quotationNumber}</span>
                        <span className="text-[11px] px-2 py-0.5 bg-surface-soft text-muted rounded-[var(--radius-pill)] font-medium">
                          {new Date(quote.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-soft">
                        {quote.items?.length || 0} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <div className="text-[12px] text-muted-soft">Grand Total</div>
                      <div className="text-[18px] font-bold text-ink">₹{quote.grandTotal.toLocaleString()}</div>
                    </div>
                    <Button variant="outline" onClick={() => handleDownloadPdf(quote.id, quote.quotationNumber)} className="shrink-0 bg-canvas">
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">PDF</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-muted">
              Page <span className="font-medium text-ink">{page}</span> of <span className="font-medium text-ink">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-canvas" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-canvas" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
