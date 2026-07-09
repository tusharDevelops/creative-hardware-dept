import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const skip = (page - 1) * limit
    
    const where = {
      OR: [
        { supplierName: { contains: search, mode: "insensitive" as const } },
        { purchaseNumber: { contains: search, mode: "insensitive" as const } }
      ]
    }

    const [total, data] = await prisma.$transaction([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: { items: true },
        orderBy: { purchaseDate: 'desc' },
        skip,
        take: limit,
      })
    ])

    return NextResponse.json({ data, totalPages: Math.ceil(total / limit) })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { supplierName, supplierMobile, subtotal, discount, gst, transportCharge, grandTotal, remarks, items } = body
    
    const purchaseNumber = `PUR-${Date.now().toString(36).toUpperCase()}`

    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase
      const newPurchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierName,
          supplierMobile,
          subtotal,
          discount,
          gst,
          transportCharge,
          grandTotal,
          remarks,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              rate: item.rate,
              amount: item.amount
            }))
          }
        },
        include: { items: true }
      })

      // 2. Update Inventory & Ledger
      for (const item of items) {
        // Increase stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } }
        })

        // Log transaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            type: "IN",
            quantity: item.quantity,
            reference: purchaseNumber,
            remarks: `Purchased from ${supplierName}`
          }
        })
      }

      return newPurchase
    })

    return NextResponse.json(purchase)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
