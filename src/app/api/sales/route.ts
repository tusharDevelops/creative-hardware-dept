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
        { saleNumber: { contains: search, mode: "insensitive" as const } },
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { customer: { mobile: { contains: search, mode: "insensitive" as const } } }
      ]
    }

    const [total, data] = await prisma.$transaction([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        include: { 
          customer: true,
          items: true 
        },
        orderBy: { saleDate: 'desc' },
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
    const { customerId, subtotal, discount, gst, transportCharge, grandTotal, remarks, items, quotationId } = body
    
    const saleNumber = `INV-${Date.now().toString(36).toUpperCase()}`

    const sale = await prisma.$transaction(async (tx) => {
      // 1. Create Sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId,
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
              amount: item.amount,
              length: item.length || null,
              width: item.width || null,
              height: item.height || null,
              pieces: item.pieces || null
            }))
          }
        },
        include: { items: true, customer: true }
      })

      // 2. Update Inventory & Ledger
      for (const item of items) {
        // Decrease stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } }
        })

        // Log transaction
        await tx.stockTransaction.create({
          data: {
            productId: item.productId,
            type: "OUT",
            quantity: item.quantity,
            reference: saleNumber,
            remarks: `Sold to Customer (ID: ${customerId})`
          }
        })
      }

      return newSale
    })

    return NextResponse.json(sale)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
