import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const mobile = searchParams.get("mobile") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
      ]
    }
    if (mobile) {
      where.mobile = mobile
    }

    const [total, customers] = await prisma.$transaction([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
    ])

    return NextResponse.json({
      data: customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const customer = await prisma.customer.update({
      where: { id: body.id },
      data: {
        name: body.name,
        mobile: body.mobile,
        address: body.address || null,
        gstNumber: body.gstNumber || null,
      }
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Auto-select/update if mobile exists
    if (body.mobile) {
      const existing = await prisma.customer.findUnique({
        where: { mobile: body.mobile }
      })
      
      if (existing) {
        const updated = await prisma.customer.update({
          where: { id: existing.id },
          data: {
            name: body.name,
            address: body.address || existing.address,
            gstNumber: body.gstNumber || existing.gstNumber,
          }
        })
        return NextResponse.json(updated)
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        mobile: body.mobile,
        address: body.address || null,
        gstNumber: body.gstNumber || null,
      },
    })
    return NextResponse.json(customer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 })
  }
}
