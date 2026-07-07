import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    
    // The data tushar.xlsx has header on row index 2
    // We will parse it dynamically and find where "MATERIAL" or "name" is
    const data = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 })
    
    let headerRowIndex = -1
    for (let i = 0; i < 10; i++) {
      if (data[i] && (data[i].includes("MATERIAL") || data[i].includes("name") || data[i].includes("RATE"))) {
        headerRowIndex = i
        break
      }
    }

    if (headerRowIndex === -1) {
      return NextResponse.json({ error: "Could not find headers in Excel file" }, { status: 400 })
    }

    const headers = data[headerRowIndex] as string[]
    const itemsToCreate = []

    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const rowObj: any = {}
      headers.forEach((header, index) => {
        if (header) {
          rowObj[header.trim()] = row[index]
        }
      })

      const name = rowObj["MATERIAL"] || rowObj["name"] || rowObj["Name"] || rowObj["Product Name"]
      const rate = rowObj["RATE"] || rowObj["sellingRate"] || rowObj["Rate"] || rowObj["Selling Rate"]
      const dealerPrice = rowObj["DP"] || rowObj["dealerPrice"] || rowObj["Dealer Price"]
      const unit = rowObj["PER SQF/PC"] || rowObj["unit"] || rowObj["Unit"] || "PCS"
      
      if (name && rate !== undefined) {
        itemsToCreate.push({
          itemCode: `IMP-${Date.now()}-${i}`,
          name: String(name).trim(),
          unit: String(unit).trim(),
          sellingRate: Number(rate),
          dealerPrice: dealerPrice ? Number(dealerPrice) : null,
          active: true,
          isDeleted: false,
        })
      }
    }

    if (itemsToCreate.length === 0) {
      return NextResponse.json({ error: "No valid products found in Excel" }, { status: 400 })
    }

    // Insert using Prisma transaction or createMany
    const created = await prisma.product.createMany({
      data: itemsToCreate,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true, count: created.count })
  } catch (error) {
    console.error("Excel import failed:", error)
    return NextResponse.json({ error: "Failed to import products" }, { status: 500 })
  }
}
