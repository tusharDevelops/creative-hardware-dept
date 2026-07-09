"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download, FileText, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function PurchasesClient() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/purchases?search=${encodeURIComponent(search)}&page=${page}&limit=20`)
        const json = await res.json()
        setPurchases(json.data || [])
        setTotalPages(json.totalPages || 1)
      } catch (e) {
        toast.error("Failed to load purchases")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchPurchases()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, page])

  useEffect(() => {
    setPage(1)
  }, [search])

  const handleDownloadPdf = async (id: string, number: string) => {
    toast.loading("Generating PDF...")
    try {
      const res = await fetch(`/api/purchases/${id}/pdf`)
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

  const handleDeletePurchase = async (id: string, number: string) => {
    if (!confirm(`Are you sure you want to delete purchase ${number}?`)) return
    try {
      const res = await fetch("/api/purchases", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success("Purchase deleted successfully")
        const temp = search
        setSearch(temp + " ")
        setTimeout(() => setSearch(temp), 0)
      } else {
        toast.error("Failed to delete purchase")
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
            placeholder="Search by purchase number, supplierName name or mobile..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Link href="/purchases/new" className="w-full sm:w-auto">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted">Loading purchases...</div>
        ) : purchases.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted">No purchases found.</div>
        ) : (
          purchases.map((purchase) => (
            <Card key={purchase.id} className="bg-canvas border border-hairline shadow-none hover:shadow-sm transition-shadow rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-soft text-ink p-2 rounded-[var(--radius-md)] border border-hairline shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="title-sm text-ink">{purchase.purchaseNumber}</div>
                      <div className="text-[12px] text-muted-soft">
                        {new Date(purchase.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Supplier</div>
                  <div className="font-medium text-ink truncate">{purchase.supplierName}</div>
                  <div className="text-[13px] text-muted-soft">{purchase.supplierMobile || "-"}</div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-hairline">
                  <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Grand Total</div>
                  <div className="font-semibold text-ink text-lg">₹{purchase.grandTotal}</div>
                </div>
              </CardContent>
              <div className="bg-surface-soft/50 border-t border-hairline p-2 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted hover:text-ink h-8 px-3 text-[13px]"
                  onClick={() => toast.info("PDF generation for purchases not yet implemented")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-error/70 hover:text-error hover:bg-error/10 h-8 px-3 text-[13px]"
                  onClick={() => handleDeletePurchase(purchase.id, purchase.purchaseNumber)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 mt-4 border-t border-hairline">
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
