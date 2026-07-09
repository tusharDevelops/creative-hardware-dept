"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, ArrowLeft, Package, User } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export function NewPurchaseClient() {
  const router = useRouter()
  const [supplierName, setSupplierName] = useState("")
  const [supplierMobile, setSupplierMobile] = useState("")
  const [remarks, setRemarks] = useState("")

  const [products, setProducts] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [cart, setCart] = useState<any[]>([])
  
  const [discount, setDiscount] = useState(0)
  const [transportCharge, setTransportCharge] = useState(0)
  const [saving, setSaving] = useState(false)

  // Fetch products
  useEffect(() => {
    const fetchProds = async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(productSearch)}&limit=10`)
        const json = await res.json()
        setProducts(json.data || [])
      } catch (e) {
        console.error(e)
      }
    }
    const timer = setTimeout(fetchProds, 300)
    return () => clearTimeout(timer)
  }, [productSearch])

  const addToCart = (product: any) => {
    const existing = cart.find(c => c.productId === product.id)
    if (existing) {
      setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1, amount: (c.quantity + 1) * c.rate } : c))
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unit: product.unit,
        rate: product.dealerPrice || product.sellingRate,
        amount: product.dealerPrice || product.sellingRate
      }])
    }
    toast.success(`Added ${product.name} to purchase list`)
  }

  const updateCartItem = (productId: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setCart(cart.map(c => {
      if (c.productId === productId) {
        const updated = { ...c, [field]: value === "" ? "" : numValue }
        updated.amount = (Number(updated.quantity) || 0) * (Number(updated.rate) || 0)
        return updated
      }
      return c
    }))
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(c => c.productId !== productId))
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const grandTotal = subtotal - discount + transportCharge

  const handleSave = async () => {
    if (!supplierName) {
      toast.error("Please enter a supplier name")
      return
    }
    if (cart.length === 0) {
      toast.error("Please add at least one item")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierName,
          supplierMobile,
          subtotal,
          discount,
          gst: 0,
          transportCharge,
          grandTotal,
          remarks,
          items: cart.map(c => ({
            ...c,
            quantity: Number(c.quantity) || 0,
            rate: Number(c.rate) || 0,
            amount: Number(c.amount) || 0
          }))
        })
      })

      if (res.ok) {
        toast.success("Purchase recorded and stock updated!")
        router.push("/purchases")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to save purchase")
      }
    } catch (e) {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* Left Column: Selection */}
      <div className="lg:col-span-7 space-y-6">
        {/* Supplier Info */}
        <Card className="bg-canvas border-hairline shadow-none">
          <CardContent className="p-4 space-y-4">
            <h3 className="title-sm text-ink flex items-center gap-2">
              <User className="w-4 h-4 text-brand-accent" />
              Supplier Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium text-muted block mb-1">Supplier Name *</label>
                <Input 
                  placeholder="e.g. Acme Hardware Corp"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-muted block mb-1">Contact Number</label>
                <Input 
                  placeholder="e.g. +91 9876543210"
                  value={supplierMobile}
                  onChange={(e) => setSupplierMobile(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card className="bg-canvas border-hairline shadow-none">
          <CardContent className="p-4 space-y-4">
            <h3 className="title-sm text-ink flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-accent" />
              Add Products to Stock
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input 
                placeholder="Search products to add..." 
                className="pl-9 bg-surface-soft border-hairline"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
            
            <div className="space-y-2 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-hairline bg-white hover:border-brand-accent/30 transition-colors">
                  <div>
                    <div className="font-medium text-ink text-sm flex items-center gap-2">
                      {p.name}
                      {p.itemCode && <span className="text-[10px] font-mono bg-surface-soft text-muted px-1.5 py-0.5 rounded">{p.itemCode}</span>}
                    </div>
                    <div className="text-[12px] text-muted flex gap-3 mt-1">
                      <span>Rate: ₹{p.dealerPrice || p.sellingRate}</span>
                      <span>Stock: {p.stockQuantity} {p.unit}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 text-brand-accent border-brand-accent/20 hover:bg-brand-accent/5" onClick={() => addToCart(p)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Cart & Summary */}
      <div className="lg:col-span-5">
        <div className="sticky top-6 space-y-6">
          <Card className="bg-canvas border-hairline shadow-none">
            <CardContent className="p-4 flex flex-col h-[calc(100vh-120px)]">
              <h3 className="title-sm text-ink mb-4 pb-4 border-b border-hairline">Incoming Items ({cart.length})</h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-muted text-sm bg-surface-soft/50 rounded-[var(--radius-lg)] border border-dashed border-hairline">
                    No items added yet.<br/>Select products from the left to receive stock.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className="p-3 bg-surface-soft/50 rounded-[var(--radius-md)] border border-hairline relative group">
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="absolute -right-2 -top-2 bg-white border border-hairline text-error rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <div className="font-medium text-ink text-sm mb-2 pr-4 truncate">{item.productName}</div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase text-muted font-medium mb-1 block">Qty ({item.unit})</label>
                          <Input type="number" className="h-8 bg-white text-sm" value={item.quantity} onChange={(e) => updateCartItem(item.productId, "quantity", e.target.value)} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-muted font-medium mb-1 block">Buy Rate (₹)</label>
                          <Input type="number" className="h-8 bg-white text-sm" value={item.rate} onChange={(e) => updateCartItem(item.productId, "rate", e.target.value)} />
                        </div>
                      </div>
                      <div className="mt-2 text-right text-sm font-semibold text-ink">
                        Amount: ₹{item.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-hairline space-y-3 bg-canvas z-10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-muted font-medium mb-1 block">Discount (₹)</label>
                    <Input type="number" className="h-9" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted font-medium mb-1 block">Transport (₹)</label>
                    <Input type="number" className="h-9" value={transportCharge} onChange={(e) => setTransportCharge(parseFloat(e.target.value) || 0)} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted font-medium mb-1 block">Remarks</label>
                  <Input placeholder="e.g. Paid via bank transfer" className="h-9" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                
                <div className="bg-brand-accent/5 p-4 rounded-[var(--radius-lg)] space-y-2 border border-brand-accent/10">
                  <div className="flex justify-between text-sm text-ink">
                    <span>Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {(discount > 0 || transportCharge > 0) && (
                    <>
                      {discount > 0 && <div className="flex justify-between text-sm text-success"><span>Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
                      {transportCharge > 0 && <div className="flex justify-between text-sm text-muted"><span>Transport</span><span>+₹{transportCharge.toFixed(2)}</span></div>}
                    </>
                  )}
                  <div className="pt-2 border-t border-brand-accent/10 flex justify-between items-center">
                    <span className="font-medium text-brand-accent">Grand Total</span>
                    <span className="text-xl font-bold text-brand-accent">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link href="/purchases" className="flex-1">
                    <Button variant="outline" className="w-full">Cancel</Button>
                  </Link>
                  <Button className="flex-1" onClick={handleSave} disabled={saving || cart.length === 0}>
                    {saving ? "Saving..." : "Save Purchase"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
