"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, ArrowLeft, ArrowRight, User } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function NewQuoteClient() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Customer, 2: Products/Review
  
  // Customer State
  const [customerSearch, setCustomerSearch] = useState("")
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  
  // Product Search State
  const [productSearch, setProductSearch] = useState("")
  const [products, setProducts] = useState<any[]>([])
  
  // Quotation Items State
  const [items, setItems] = useState<any[]>([])
  const [totals, setTotals] = useState({ subtotal: 0, discount: 0, gst: 0, transport: 0, grandTotal: 0 })
  
  // Bottom Sheet/Modal state for adding an item
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [pieces, setPieces] = useState<number | "">("")
  const [length, setLength] = useState<number | "">("")
  const [width, setWidth] = useState<number | "">("")
  const [height, setHeight] = useState<number | "">("")
  const [rate, setRate] = useState<number | "">("")
  const [discount, setDiscount] = useState<number | "">(0)
  const [unitScale, setUnitScale] = useState<"FEET" | "INCH">("FEET")

  // Fetch customers
  useEffect(() => {
    if (step === 1 && customerSearch.length > 1) {
      const fetchCustomers = async () => {
        const res = await fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}&limit=10`)
        const json = await res.json()
        setCustomers(json.data || [])
      }
      const timer = setTimeout(fetchCustomers, 300)
      return () => clearTimeout(timer)
    }
  }, [customerSearch, step])

  // Fetch products
  useEffect(() => {
    if (step === 2 && productSearch.length > 1) {
      const fetchProducts = async () => {
        const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=10`)
        const json = await res.json()
        setProducts(json.data || [])
      }
      const timer = setTimeout(fetchProducts, 300)
      return () => clearTimeout(timer)
    } else if (productSearch.length === 0) {
      setProducts([])
    }
  }, [productSearch, step])

  // Recalculate totals
  useEffect(() => {
    let subtotal = 0
    items.forEach(item => subtotal += item.amount)
    
    // In a real app, GST and Discount might be complex. Keeping it simple per PRD.
    const grandTotal = subtotal - totals.discount + totals.gst + totals.transport
    setTotals(prev => ({ ...prev, subtotal: Number(subtotal.toFixed(2)), grandTotal: Number(grandTotal.toFixed(2)) }))
  }, [items, totals.discount, totals.gst, totals.transport])

  const handleCreateCustomer = async () => {
    const isMobile = /^\d+$/.test(customerSearch) && customerSearch.length >= 10
    const body = isMobile ? { mobile: customerSearch, name: "New Customer" } : { name: customerSearch, mobile: `+91${Date.now().toString().slice(3)}` }
    
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        setSelectedCustomer(data)
        setStep(2)
        toast.success("Customer selected")
      } else {
        toast.error("Failed to create customer")
      }
    } catch (e) {
      toast.error("Error creating customer")
    }
  }

  // Dynamic quantity calculation based on unit
  const getCalculatedQty = (product: any, p: number|"", l: number|"", w: number|"", h: number|"", scale: "FEET"|"INCH" = "FEET") => {
    if (!product) return 0
    const pcs = Number(p) || 0
    let len = Number(l) || 0
    let wid = Number(w) || 0
    let hgt = Number(h) || 0
    
    if (scale === "INCH") {
      len = len / 12
      wid = wid / 12
      hgt = hgt / 12
    }
    
    const u = product.unit?.toUpperCase() || ""
    if (["SQFT", "SQM", "SQRFT"].includes(u)) {
      return len * wid * pcs
    } else if (["RFT", "RM", "MTR"].includes(u)) {
      return len * pcs
    } else if (["CFT", "CBM"].includes(u)) {
      return len * wid * hgt * pcs
    }
    return pcs // For PCS, KG, etc, the 'pieces' field acts as the flat quantity
  }

  const handleAddItem = () => {
    const finalQty = getCalculatedQty(selectedProduct, pieces, length, width, height, unitScale)
    
    if (!selectedProduct || finalQty <= 0 || !rate) {
      toast.error("Please fill dimensions/quantity and rate")
      return
    }
    
    const amount = (finalQty * Number(rate)) - Number(discount || 0)
    
    setItems([...items, {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unit: selectedProduct.unit,
      length: Number(length) || null,
      width: Number(width) || null,
      height: Number(height) || null,
      pieces: Number(pieces) || null,
      quantity: Number(finalQty.toFixed(2)),
      rate: Number(rate),
      amount: Number(amount.toFixed(2))
    }])
    
    setSelectedProduct(null)
    setProductSearch("")
    setProducts([])
  }

  const handleSaveQuotation = async () => {
    if (items.length === 0) {
      toast.error("Add at least one product")
      return
    }

    try {
      toast.loading("Saving quotation...")
      const res = await fetch("/api/quotations", {
        method: "POST",
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          subtotal: totals.subtotal,
          discount: totals.discount,
          gst: totals.gst,
          transportCharge: totals.transport,
          grandTotal: totals.grandTotal,
          items: items
        })
      })
      const data = await res.json()
      toast.dismiss()
      if (res.ok) {
        toast.success("Quotation Saved!")
        // TODO: Redirect to PDF or History
        router.push(`/quotations`)
      } else {
        toast.error("Failed to save")
      }
    } catch (e) {
      toast.error("Error saving quotation")
    }
  }

  return (
    <div className="flex-1 flex flex-col pb-32">
      {/* Step 1: Customer */}
      {step === 1 && (
        <Card className="flex-1 border-none shadow-none bg-canvas">
          <CardHeader>
            <CardTitle className="title-md text-ink">Select Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input 
                autoFocus
                placeholder="Search by name or mobile number..." 
                className="pl-9 h-14 text-[16px]"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 mt-4">
              {customers.map(c => (
                <div 
                  key={c.id} 
                  className="p-4 rounded-[var(--radius-lg)] hover:bg-surface-soft cursor-pointer flex items-center justify-between border border-hairline transition-colors"
                  onClick={() => { setSelectedCustomer(c); setStep(2); }}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-surface-card p-3 rounded-[var(--radius-full)]">
                      <User className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <div className="title-sm text-ink">{c.name}</div>
                      <div className="text-[13px] text-muted-soft mt-1">{c.mobile}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                </div>
              ))}
              
              {customerSearch.length > 2 && customers.length === 0 && (
                <Button 
                  variant="outline" 
                  className="w-full h-14 border-dashed border-2 border-hairline text-ink hover:bg-surface-soft"
                  onClick={handleCreateCustomer}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add "{customerSearch}" as New Customer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Products */}
      {step === 2 && (
        <div className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between bg-surface-card p-4 rounded-[var(--radius-lg)]">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 text-ink">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="title-sm text-ink">
                {selectedCustomer?.name}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Search products..." 
              className="pl-9 h-14 text-[16px] focus-visible:border-ink transition-colors"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
          </div>

          {/* Product Search Results Dropdown */}
          {products.length > 0 && (
            <Card className="absolute z-10 w-[calc(100%-2rem)] max-w-2xl mt-[5rem] max-h-64 overflow-y-auto shadow-lg border-hairline bg-canvas rounded-[var(--radius-lg)]">
              <div className="divide-y divide-hairline">
                {products.map(p => (
                  <div 
                    key={p.id}
                    className="p-4 hover:bg-surface-soft cursor-pointer flex justify-between items-center transition-colors"
                    onClick={() => {
                      setSelectedProduct(p)
                      setPieces(1)
                      setLength(p.defaultLength ? p.defaultLength : "")
                      setWidth(p.defaultWidth ? p.defaultWidth : "")
                      setHeight(p.defaultHeight ? p.defaultHeight : "")
                      setRate(p.sellingRate)
                      setDiscount(0)
                      setUnitScale("FEET")
                      setProducts([])
                    }}
                  >
                    <div>
                      <div className="title-sm text-ink">{p.name}</div>
                      <div className="text-[13px] text-muted mt-1">{p.unit}</div>
                    </div>
                    <div className="font-semibold text-ink">₹{p.sellingRate}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Added Items List */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            {items.map((item, idx) => {
              const dims = []
              if (item.length) dims.push(item.length)
              if (item.width) dims.push(item.width)
              if (item.height) dims.push(item.height)
              
              let dimStr = ""
              if (dims.length > 0) {
                dimStr = ` (${dims.join("x")}`
                if (item.pieces) dimStr += ` x ${item.pieces} SHT`
                dimStr += ")"
              } else if (item.pieces && item.pieces !== item.quantity) {
                dimStr = ` (${item.pieces} PCS)`
              }

              return (
              <Card key={idx} className="shadow-none border border-hairline bg-canvas rounded-[var(--radius-lg)]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="title-sm text-ink">{item.productName}{dimStr}</div>
                    <div className="text-[13px] text-muted-soft mt-1">
                      {item.quantity} {item.unit} x ₹{item.rate}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-ink">₹{item.amount}</div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-error h-8 w-8 hover:bg-error/10"
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              )
            })}
            {items.length === 0 && !selectedProduct && (
              <div className="text-center p-8 text-muted text-[14px]">
                Search and select products to add them to the quotation.
              </div>
            )}
          </div>

          {/* Product Bottom Sheet */}
          {selectedProduct && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
              <Card className="w-full max-w-md animate-in slide-in-from-bottom-10 bg-canvas rounded-[var(--radius-xl)]">
                <CardHeader>
                  <CardTitle className="title-md text-ink">{selectedProduct.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {(() => {
                    const u = selectedProduct.unit?.toUpperCase() || ""
                    const is2D = ["SQFT", "SQM", "SQRFT"].includes(u)
                    const is1D = ["RFT", "RM", "MTR"].includes(u)
                    const is3D = ["CFT", "CBM"].includes(u)
                    const isFlat = !is1D && !is2D && !is3D

                    return (
                      <div className="space-y-4">
                        {/* Measurement Toggle */}
                        {!isFlat && (!selectedProduct.defaultLength) && (
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
                        )}

                        {/* Dimensional Inputs */}
                        {!isFlat && (
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                              <label className="text-[12px] font-medium text-muted">Length {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                              <Input 
                                type="number" 
                                value={length} 
                                onChange={e => setLength(Number(e.target.value) || "")}
                                readOnly={!!selectedProduct.defaultLength} 
                                className={`h-10 ${!!selectedProduct.defaultLength ? 'bg-surface-soft opacity-70' : 'bg-white border-hairline'}`} 
                              />
                            </div>
                            {(is2D || is3D) && (
                              <div className="space-y-2">
                                <label className="text-[12px] font-medium text-muted">Width {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                                <Input 
                                  type="number" 
                                  value={width} 
                                  onChange={e => setWidth(Number(e.target.value) || "")}
                                  readOnly={!!selectedProduct.defaultWidth} 
                                  className={`h-10 ${!!selectedProduct.defaultWidth ? 'bg-surface-soft opacity-70' : 'bg-white border-hairline'}`} 
                                />
                              </div>
                            )}
                            {is3D && (
                              <div className="space-y-2">
                                <label className="text-[12px] font-medium text-muted">Height {unitScale === "INCH" ? "(in)" : "(ft)"}</label>
                                <Input 
                                  type="number" 
                                  value={height} 
                                  onChange={e => setHeight(Number(e.target.value) || "")}
                                  readOnly={!!selectedProduct.defaultHeight} 
                                  className={`h-10 ${!!selectedProduct.defaultHeight ? 'bg-surface-soft opacity-70' : 'bg-white border-hairline'}`} 
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quantity / Pieces & Rate */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[13px] font-medium text-muted">
                              {isFlat ? `Quantity (${selectedProduct.unit})` : "Pieces / Sheets"}
                            </label>
                            <Input 
                              type="number" 
                              value={pieces} 
                              onChange={(e) => setPieces(Number(e.target.value) || "")} 
                              className="h-12 text-[16px] font-medium"
                              autoFocus
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[13px] font-medium text-muted">Rate (₹)</label>
                            <Input 
                              type="number" 
                              value={rate} 
                              onChange={(e) => setRate(Number(e.target.value) || "")} 
                              className="h-12 text-[16px] font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="space-y-2">
                    <label className="text-[13px] font-medium text-muted">Discount (₹) Optional</label>
                    <Input 
                      type="number" 
                      value={discount} 
                      onChange={(e) => setDiscount(Number(e.target.value) || "")} 
                      className="h-12 text-[16px]"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-hairline">
                    <div className="display-sm text-ink">
                      Total: ₹{((getCalculatedQty(selectedProduct, pieces, length, width, height, unitScale) * (Number(rate) || 0)) - (Number(discount) || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                    <Button className="flex-1" onClick={handleAddItem}>Add to Quote</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sticky Bottom Summary */}
          {items.length > 0 && (
            <div className="fixed bottom-16 sm:bottom-0 left-0 w-full bg-canvas border-t border-hairline p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="flex justify-between text-[14px]">
                  <span className="text-muted">Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-ink">₹{totals.subtotal}</span>
                </div>
                <div className="flex justify-between items-end border-t border-hairline pt-3">
                  <div>
                    <div className="text-[13px] text-muted-soft">Grand Total</div>
                    <div className="display-sm text-ink">₹{totals.grandTotal}</div>
                  </div>
                  <Button className="px-8" onClick={handleSaveQuotation}>
                    Generate PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
