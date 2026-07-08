"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Eye, X, Users } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function CustomersClient() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: "", mobile: "", address: "", gstNumber: "" })
  const fetchRef = useRef(0)

  const fetchCustomers = useCallback(async (searchTerm: string, pageNum: number) => {
    const id = ++fetchRef.current
    setLoading(true)
    try {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=20`)
      const json = await res.json()
      if (id !== fetchRef.current) return // stale request
      setCustomers(json.data || [])
      setTotalPages(json.totalPages || 1)
      setTotal(json.total || 0)
    } catch (e) {
      toast.error("Failed to load customers")
    } finally {
      if (id === fetchRef.current) setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search, page)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, page, fetchCustomers])

  // Reset page on search change
  useEffect(() => {
    setPage(1)
  }, [search])

  const openAddModal = () => {
    setEditingCustomer(null)
    setFormData({ name: "", mobile: "", address: "", gstNumber: "" })
    setShowModal(true)
  }

  const openEditModal = (customer: any) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      address: customer.address || "",
      gstNumber: customer.gstNumber || "",
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.mobile) {
      toast.error("Name and Mobile are required")
      return
    }
    setSaving(true)
    try {
      const isEdit = !!editingCustomer
      const res = await fetch("/api/customers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { ...formData, id: editingCustomer.id } : formData),
      })
      if (res.ok) {
        toast.success(isEdit ? "Customer updated" : "Customer added")
        setShowModal(false)
        fetchCustomers(search, page)
      } else {
        const err = await res.json()
        toast.error(err.error || "Operation failed")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete customer "${name}"? This cannot be undone.`)) return
    try {
      const res = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success("Customer deleted")
        fetchCustomers(search, page)
      } else {
        toast.error("Cannot delete customer with existing quotations")
      }
    } catch {
      toast.error("Failed to delete")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search by name or mobile..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted">
            Loading customers...
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-muted-soft" />
              <p className="text-muted font-medium">No customers found</p>
            </div>
          </div>
        ) : (
          customers.map((c) => (
            <Card key={c.id} className="bg-canvas border border-hairline shadow-none hover:shadow-sm transition-shadow rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-ink font-bold border border-hairline shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="title-sm text-ink truncate">{c.name}</h3>
                    <div className="text-[13px] text-muted flex items-center gap-2 mt-1">
                      {c.mobile}
                    </div>
                  </div>
                </div>

                {(c.address || c.gstNumber) && (
                  <div className="grid grid-cols-1 gap-2 mt-auto pt-4 border-t border-hairline">
                    {c.address && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Address</div>
                        <div className="text-[13px] text-ink truncate">{c.address}</div>
                      </div>
                    )}
                    {c.gstNumber && (
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">GST Number</div>
                        <div className="text-[13px] text-ink truncate">{c.gstNumber}</div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <div className="bg-surface-soft/50 border-t border-hairline p-2 flex justify-end gap-2">
                <Link href={`/customers/${c.id}`}>
                  <Button variant="ghost" size="sm" className="text-muted hover:text-ink h-8 px-3 text-[13px]">
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-muted hover:text-ink h-8 px-3 text-[13px]" onClick={() => openEditModal(c)}>
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-error/70 hover:text-error hover:bg-error/10 h-8 px-3 text-[13px]" onClick={() => handleDelete(c.id, c.name)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4 mt-4 border-t border-hairline">
              <span className="text-sm text-muted">
                Page <span className="font-medium text-ink">{page}</span> of <span className="font-medium text-ink">{totalPages}</span>
                <span className="hidden sm:inline"> · {total} customers</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Next
                </Button>
              </div>
            </div>
          )}


      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 bg-canvas rounded-[var(--radius-xl)] shadow-xl border-none">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="title-md text-ink">{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Name *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Customer name" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Mobile *</label>
                  <Input value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="10-digit mobile" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Address</label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">GST Number</label>
                  <Input value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editingCustomer ? "Update" : "Add Customer"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
