import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const currentYear = new Date().getFullYear()
    const lastQuote = await prisma.quotation.findFirst({
      where: { quotationNumber: { startsWith: `QT-${currentYear}-` } },
      orderBy: { quotationNumber: 'desc' }
    })
    
    let nextNum = 1
    if (lastQuote) {
      const parts = lastQuote.quotationNumber.split('-')
      nextNum = parseInt(parts[2] || "0", 10) + 1
    }
    const quotationNumber = `QT-${currentYear}-${nextNum.toString().padStart(4, '0')}`

    const quote = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: body.customerId,
        subtotal: Number(body.subtotal),
        discount: Number(body.discount || 0),
        gst: Number(body.gst || 0),
        transportCharge: Number(body.transportCharge || 0),
        grandTotal: Number(body.grandTotal),
        remarks: body.remarks || null,
        items: {
          create: body.items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity),
            length: item.length ? Number(item.length) : null,
            width: item.width ? Number(item.width) : null,
            height: item.height ? Number(item.height) : null,
            pieces: item.pieces ? Number(item.pieces) : null,
            unit: item.unit,
            rate: Number(item.rate),
            amount: Number(item.amount),
          }))
        }
      },
      include: {
        customer: true,
        items: true,
      }
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Failed to create quotation:", error)
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { id: { equals: search } },
        { quotationNumber: { contains: search, mode: "insensitive" as const } },
        { customer: { name: { contains: search, mode: "insensitive" as const } } },
        { customer: { mobile: { contains: search, mode: "insensitive" as const } } },
      ]
    } : {}

    const [total, data] = await prisma.$transaction([
      prisma.quotation.count({ where }),
      prisma.quotation.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ])

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Failed to fetch quotations:", error)
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.quotation.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete quotation:", error)
    return NextResponse.json({ error: "Failed to delete quotation" }, { status: 500 })
  }
}
