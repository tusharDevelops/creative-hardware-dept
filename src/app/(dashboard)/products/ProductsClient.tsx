"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Upload, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

export function ProductsClient({ isAdmin }: { isAdmin: boolean }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "PCS",
    defaultLength: "",
    defaultWidth: "",
    defaultHeight: "",
    sellingRate: "",
    dealerPrice: "",
    image: null as File | null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(search)}&page=${page}&limit=20`)
        const json = await res.json()
        setProducts(json.data || [])
        setTotalPages(json.totalPages || 1)
      } catch (e) {
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [search, page])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    toast.info("Uploading Excel file...")
    
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`Imported ${data.count} products successfully!`)
        // Trigger reload
        setSearch((s) => s + " ")
        setTimeout(() => setSearch((s) => s.trim()), 0)
      } else {
        toast.error(data.error || "Failed to import")
      }
    } catch (err) {
      toast.error("An error occurred during import")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.sellingRate) {
      toast.error("Name and Selling Rate are required")
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      if (editingProduct) formData.append("id", editingProduct.id)
      formData.append("name", newProduct.name)
      formData.append("unit", newProduct.unit)
      if (newProduct.defaultLength) formData.append("defaultLength", newProduct.defaultLength)
      if (newProduct.defaultWidth) formData.append("defaultWidth", newProduct.defaultWidth)
      if (newProduct.defaultHeight) formData.append("defaultHeight", newProduct.defaultHeight)
      formData.append("sellingRate", newProduct.sellingRate)
      if (newProduct.dealerPrice) {
        formData.append("dealerPrice", newProduct.dealerPrice)
      }
      if (newProduct.image) {
        formData.append("image", newProduct.image)
      }

      const res = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      })

      if (res.ok) {
        toast.success(editingProduct ? "Product updated successfully" : "Product added successfully")
        setShowAddModal(false)
        setEditingProduct(null)
        setNewProduct({ name: "", unit: "PCS", defaultLength: "", defaultWidth: "", defaultHeight: "", sellingRate: "", dealerPrice: "", image: null })
        
        // Trigger reload
        const temp = search
        setSearch(temp + " ")
        setTimeout(() => setSearch(temp), 0)
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save product")
      }
    } catch (e) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        toast.success("Product deleted successfully")
        const temp = search
        setSearch(temp + " ")
        setTimeout(() => setSearch(temp), 0)
      } else {
        toast.error("Failed to delete product")
      }
    } catch (e) {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input 
            placeholder="Search products by name, size, or brand..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isAdmin && (
            <>
              <input 
                type="file" 
                accept=".xlsx,.xls" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </>
          )}
          <Button className="flex-1 sm:flex-none" onClick={() => {
            setEditingProduct(null)
            setNewProduct({ name: "", unit: "PCS", defaultLength: "", defaultWidth: "", defaultHeight: "", sellingRate: "", dealerPrice: "", image: null })
            setShowAddModal(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <Card className="border-none bg-surface-card rounded-[var(--radius-lg)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[13px] text-muted-soft uppercase bg-canvas border-b border-hairline">
                <tr>
                  <th className="px-4 py-3 font-semibold text-ink">Product Name</th>
                  <th className="px-4 py-3 font-semibold text-ink">Unit</th>
                  <th className="px-4 py-3 font-semibold text-right text-ink">Selling Rate</th>
                  {isAdmin && <th className="px-4 py-3 font-semibold text-right text-brand-accent">Dealer Price</th>}
                  <th className="px-4 py-3 font-semibold text-right text-ink">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-muted">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-soft transition-colors">
                      <td className="px-4 py-3 font-medium text-ink flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-8 h-8 rounded object-cover border border-hairline bg-canvas" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-surface-dark/10 flex items-center justify-center text-muted-soft text-xs font-bold border border-hairline">IMG</div>
                        )}
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-muted">{product.unit}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink">₹{product.sellingRate}</td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right text-brand-accent font-medium">
                          {product.dealerPrice ? `₹${product.dealerPrice}` : "-"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted hover:text-ink"
                            onClick={() => {
                              setEditingProduct(product)
                              setNewProduct({
                                name: product.name,
                                unit: product.unit,
                                defaultLength: product.defaultLength ? product.defaultLength.toString() : "",
                                defaultWidth: product.defaultWidth ? product.defaultWidth.toString() : "",
                                defaultHeight: product.defaultHeight ? product.defaultHeight.toString() : "",
                                sellingRate: product.sellingRate.toString(),
                                dealerPrice: product.dealerPrice ? product.dealerPrice.toString() : "",
                                image: null
                              })
                              setShowAddModal(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted hover:text-error"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-hairline bg-canvas">
              <span className="text-sm text-muted">
                Page <span className="font-medium text-ink">{page}</span> of <span className="font-medium text-ink">{totalPages}</span>
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md animate-in zoom-in-95 bg-canvas rounded-[var(--radius-xl)] shadow-xl border-none">
            <div className="p-6">
              <h2 className="title-md text-ink mb-4">{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Product Name *</label>
                  <Input 
                    placeholder="e.g. 18mm Plywood"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted block mb-1">Unit</label>
                    <Input 
                      placeholder="e.g. PCS, SQFT, CFT"
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct({...newProduct, unit: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                {(() => {
                  const u = newProduct.unit;
                  const is2D = ["SQFT", "SQM", "SQRFT", "SHT"].includes(u);
                  const is1D = ["RFT", "RM", "MTR"].includes(u);
                  const is3D = ["CFT", "CBM"].includes(u);
                  const hasDims = is1D || is2D || is3D;

                  if (!hasDims) return null;

                  return (
                    <div className="grid grid-cols-3 gap-4 p-3 bg-surface-soft rounded-[var(--radius-md)] border border-hairline">
                      <div>
                        <label className="text-[12px] font-medium text-muted block mb-1">Std Length</label>
                        <Input type="number" placeholder="e.g. 8" value={newProduct.defaultLength} onChange={(e) => setNewProduct({...newProduct, defaultLength: e.target.value})} className="h-9" />
                      </div>
                      {(is2D || is3D) && (
                        <div>
                          <label className="text-[12px] font-medium text-muted block mb-1">Std Width</label>
                          <Input type="number" placeholder="e.g. 4" value={newProduct.defaultWidth} onChange={(e) => setNewProduct({...newProduct, defaultWidth: e.target.value})} className="h-9" />
                        </div>
                      )}
                      {is3D && (
                        <div>
                          <label className="text-[12px] font-medium text-muted block mb-1">Std Height</label>
                          <Input type="number" value={newProduct.defaultHeight} onChange={(e) => setNewProduct({...newProduct, defaultHeight: e.target.value})} className="h-9" />
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-muted block mb-1">Selling Rate *</label>
                    <Input 
                      type="number"
                      placeholder="₹"
                      value={newProduct.sellingRate}
                      onChange={(e) => setNewProduct({...newProduct, sellingRate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Dealer Price (Optional)</label>
                  <Input 
                    type="number"
                    placeholder="₹"
                    value={newProduct.dealerPrice}
                    onChange={(e) => setNewProduct({...newProduct, dealerPrice: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-muted block mb-1">Product Image (Optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={imageInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewProduct({...newProduct, image: e.target.files[0]})
                      }
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full h-10 border-dashed"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {newProduct.image ? newProduct.image.name : "Upload Image"}
                    </Button>
                    {newProduct.image && (
                      <Button variant="ghost" size="icon" onClick={() => setNewProduct({...newProduct, image: null})} className="text-error h-10 w-10 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSaveProduct} disabled={saving}>
                  {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
