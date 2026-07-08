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
  const [unitScale, setUnitScale] = useState<"FEET" | "INCH">("FEET")
  
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
      
      let dLen = newProduct.defaultLength
      let dWid = newProduct.defaultWidth
      let dHgt = newProduct.defaultHeight
      
      if (unitScale === "INCH") {
        if (dLen) dLen = (Number(dLen) / 12).toString()
        if (dWid) dWid = (Number(dWid) / 12).toString()
        if (dHgt) dHgt = (Number(dHgt) / 12).toString()
      }

      if (dLen) formData.append("defaultLength", dLen)
      if (dWid) formData.append("defaultWidth", dWid)
      if (dHgt) formData.append("defaultHeight", dHgt)
      
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
        setUnitScale("FEET")
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
            setUnitScale("FEET")
            setNewProduct({ name: "", unit: "PCS", defaultLength: "", defaultWidth: "", defaultHeight: "", sellingRate: "", dealerPrice: "", image: null })
            setShowAddModal(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-8 text-center text-muted">
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-8 text-center text-muted">
            No products found.
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="bg-canvas border border-hairline shadow-none hover:shadow-sm transition-shadow rounded-[var(--radius-lg)] overflow-hidden flex flex-col">
              <CardContent className="p-4 flex-1 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-hairline bg-surface-soft shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-dark/5 flex items-center justify-center text-muted-soft text-xs font-bold border border-hairline shrink-0">IMG</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="title-sm text-ink truncate">{product.name}</h3>
                    <div className="text-[13px] text-muted flex items-center gap-2 mt-1">
                      <span className="bg-surface-soft px-2 py-0.5 rounded-md font-medium text-[11px] uppercase tracking-wider">{product.unit}</span>
                      {product.defaultLength && (
                        <span>
                          {product.defaultLength} {product.defaultWidth ? `× ${product.defaultWidth}` : ''} {product.defaultHeight ? `× ${product.defaultHeight}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-hairline">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Selling Rate</div>
                    <div className="font-semibold text-ink text-lg">₹{product.sellingRate}</div>
                  </div>
                  {isAdmin && (
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-brand-accent font-medium mb-1">Dealer Price</div>
                      <div className="font-semibold text-brand-accent/90 text-lg">{product.dealerPrice ? `₹${product.dealerPrice}` : "-"}</div>
                    </div>
                  )}
                </div>
              </CardContent>
              <div className="bg-surface-soft/50 border-t border-hairline p-2 flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted hover:text-ink h-8 px-3 text-[13px]"
                  onClick={() => {
                    setEditingProduct(product)
                    setUnitScale("FEET")
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
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                {isAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-error/70 hover:text-error hover:bg-error/10 h-8 px-3 text-[13px]"
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
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


      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 bg-canvas rounded-[var(--radius-xl)] shadow-xl border-none">
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
                    <div className="space-y-3">
                      <div className="flex bg-surface-soft p-1 rounded-[var(--radius-lg)] w-fit">
                        <button
                          className={`px-4 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] transition-colors ${unitScale === "FEET" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                          onClick={() => setUnitScale("FEET")}
                        >
                          Feet
                        </button>
                        <button
                          className={`px-4 py-1.5 text-[13px] font-medium rounded-[var(--radius-md)] transition-colors ${unitScale === "INCH" ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
                          onClick={() => setUnitScale("INCH")}
                        >
                          Inch
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 p-3 bg-surface-soft rounded-[var(--radius-md)] border border-hairline">
                        <div>
                          <label className="text-[12px] font-medium text-muted block mb-1">Std Length {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                          <Input type="number" placeholder="e.g. 8" value={newProduct.defaultLength} onChange={(e) => setNewProduct({...newProduct, defaultLength: e.target.value})} className="h-9 bg-white" />
                        </div>
                        {(is2D || is3D) && (
                          <div>
                            <label className="text-[12px] font-medium text-muted block mb-1">Std Width {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                            <Input type="number" placeholder="e.g. 4" value={newProduct.defaultWidth} onChange={(e) => setNewProduct({...newProduct, defaultWidth: e.target.value})} className="h-9 bg-white" />
                          </div>
                        )}
                        {is3D && (
                          <div>
                            <label className="text-[12px] font-medium text-muted block mb-1">Std Height {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                            <Input type="number" value={newProduct.defaultHeight} onChange={(e) => setNewProduct({...newProduct, defaultHeight: e.target.value})} className="h-9 bg-white" />
                          </div>
                        )}
                      </div>
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
