import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from "cloudinary"

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const skip = (page - 1) * limit

    const where = {
      isDeleted: false,
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { itemCode: { contains: search, mode: "insensitive" as const } },
        { category: { contains: search, mode: "insensitive" as const } }
      ]
    }

    const [total, data] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: {
          name: "asc",
        },
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
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const itemCode = formData.get("itemCode") as string || `PRD-${Date.now()}`
    const name = formData.get("name") as string
    const brand = formData.get("brand") as string | null
    const category = formData.get("category") as string | null
    const unit = formData.get("unit") as string || "PCS"
    const sellingRate = Number(formData.get("sellingRate"))
    const dealerPrice = formData.get("dealerPrice") ? Number(formData.get("dealerPrice")) : null
    const gstPercentage = formData.get("gstPercentage") ? Number(formData.get("gstPercentage")) : 0
    
    const defaultLength = formData.get("defaultLength") ? Number(formData.get("defaultLength")) : null
    const defaultWidth = formData.get("defaultWidth") ? Number(formData.get("defaultWidth")) : null
    const defaultHeight = formData.get("defaultHeight") ? Number(formData.get("defaultHeight")) : null

    let imageUrl: string | null = null
    const file = formData.get("image") as File | null

    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const dataUri = `data:${file.type};base64,${base64}`
      
      const uploadResponse = await cloudinary.uploader.upload(dataUri, { folder: "products" })
      imageUrl = uploadResponse.secure_url
    }

    const product = await prisma.product.create({
      data: {
        itemCode,
        name,
        brand,
        category,
        unit,
        defaultLength,
        defaultWidth,
        defaultHeight,
        sellingRate,
        dealerPrice,
        gstPercentage,
        imageUrl,
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const id = formData.get("id") as string
    if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 })

    const itemCode = formData.get("itemCode") as string | null
    const name = formData.get("name") as string
    const brand = formData.get("brand") as string | null
    const category = formData.get("category") as string | null
    const unit = formData.get("unit") as string || "PCS"
    const sellingRate = Number(formData.get("sellingRate"))
    const dealerPrice = formData.get("dealerPrice") ? Number(formData.get("dealerPrice")) : null
    const gstPercentage = formData.get("gstPercentage") ? Number(formData.get("gstPercentage")) : 0
    
    const defaultLength = formData.get("defaultLength") ? Number(formData.get("defaultLength")) : null
    const defaultWidth = formData.get("defaultWidth") ? Number(formData.get("defaultWidth")) : null
    const defaultHeight = formData.get("defaultHeight") ? Number(formData.get("defaultHeight")) : null

    let imageUrl: string | undefined = undefined
    const file = formData.get("image") as File | null

    if (file && file.size > 0) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString("base64")
      const dataUri = `data:${file.type};base64,${base64}`
      
      const uploadResponse = await cloudinary.uploader.upload(dataUri, { folder: "products" })
      imageUrl = uploadResponse.secure_url
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(itemCode && { itemCode }),
        name,
        brand,
        category,
        unit,
        defaultLength,
        defaultWidth,
        defaultHeight,
        sellingRate,
        dealerPrice,
        gstPercentage,
        ...(imageUrl && { imageUrl }), // Only update if new image uploaded
      },
    })
    return NextResponse.json(product)
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
