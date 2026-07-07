import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const customer = await prisma.customer.findUnique({
      where: { id },
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    const [totalQuotes, quotations] = await prisma.$transaction([
      prisma.quotation.count({ where: { customerId: id } }),
      prisma.quotation.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
        skip,
        take: limit,
      })
    ])

    return NextResponse.json({
      customer,
      quotations: {
        data: quotations,
        total: totalQuotes,
        page,
        totalPages: Math.ceil(totalQuotes / limit),
      }
    })
  } catch (error) {
    console.error("Failed to fetch customer:", error)
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 })
  }
}
