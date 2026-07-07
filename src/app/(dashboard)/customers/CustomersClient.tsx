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

      <Card className="border-none bg-surface-card rounded-[var(--radius-lg)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[13px] text-muted-soft uppercase bg-canvas border-b border-hairline">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink">Name</th>
                  <th className="px-4 py-3 font-semibold text-ink">Mobile</th>
                  <th className="px-4 py-3 font-semibold text-ink hidden md:table-cell">Address</th>
                  <th className="px-4 py-3 font-semibold text-ink hidden md:table-cell">GST</th>
                  <th className="px-4 py-3 font-semibold text-right text-ink">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading customers...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-muted-soft" />
                        <p className="text-muted font-medium">No customers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-soft transition-colors">
                      <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                      <td className="px-4 py-3 text-muted">{c.mobile}</td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">{c.address || "—"}</td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">{c.gstNumber || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/customers/${c.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-ink">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-ink" onClick={() => openEditModal(c)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-error" onClick={() => handleDelete(c.id, c.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-hairline bg-canvas">
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
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 bg-canvas rounded-[var(--radius-xl)] shadow-xl border-none">
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
