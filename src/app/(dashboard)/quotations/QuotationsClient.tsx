"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, FileText, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function QuotationsClient() {
  const [quotations, setQuotations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchQuotes = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/quotations?search=${encodeURIComponent(search)}&page=${page}&limit=20`)
        const json = await res.json()
        setQuotations(json.data || [])
        setTotalPages(json.totalPages || 1)
      } catch (e) {
        toast.error("Failed to load quotations")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchQuotes()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleDownloadPdf = async (id: string, number: string) => {
    toast.loading("Generating PDF...")
    try {
      const res = await fetch(`/api/quotations/${id}/pdf`)
      if (!res.ok) throw new Error("Failed to generate PDF")
      
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
    } catch (e) {
      toast.dismiss()
      toast.error("Failed to generate PDF")
    }
  }

  const handleDeleteQuote = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete quotation ${number}?`)) return
    try {
      const res = await fetch("/api/quotations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success("Quotation deleted successfully")
        const temp = search
        setSearch(temp + " ")
        setTimeout(() => setSearch(temp), 0)
      } else {
        toast.error("Failed to delete quotation")
      }
    } catch (e) {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input 
            placeholder="Search by quote number, customer name or mobile..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/quotations/new" className="w-full sm:w-auto">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center p-8 text-muted">Loading quotations...</div>
        ) : quotations.length === 0 ? (
          <div className="text-center p-8 text-muted">No quotations found.</div>
        ) : (
          quotations.map((quote) => (
            <Card key={quote.id} className="border-none bg-surface-card rounded-[var(--radius-lg)] shadow-none">
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-canvas text-ink p-3 rounded-[var(--radius-md)] hidden sm:block border border-hairline">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="title-md text-ink">{quote.quotationNumber}</span>
                      <span className="text-[12px] px-2 py-1 bg-surface-soft text-muted rounded-[var(--radius-pill)] font-medium">
                        {new Date(quote.quotationDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="font-medium text-ink">{quote.customer.name}</div>
                    <div className="text-[13px] text-muted-soft">{quote.customer.mobile}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full border-t border-hairline sm:border-0 pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[13px] text-muted-soft">Grand Total</div>
                    <div className="display-sm text-ink">₹{quote.grandTotal}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownloadPdf(quote.id, quote.quotationNumber)}
                      className="shrink-0 bg-canvas"
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteQuote(quote.id, quote.quotationNumber)}
                      className="shrink-0 bg-canvas text-error hover:bg-error/10 hover:text-error hover:border-error"
                      size="icon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <span className="text-sm text-muted">
            Page <span className="font-medium text-ink">{page}</span> of <span className="font-medium text-ink">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-canvas"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-canvas"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
