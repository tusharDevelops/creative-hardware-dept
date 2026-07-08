import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      orderBy: { name: "asc" }
    })

    const pdfDoc = await PDFDocument.create()
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const A4_WIDTH = 595.28
    const A4_HEIGHT = 841.89
    const MARGIN = 50
    let page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
    let currentY = A4_HEIGHT - MARGIN

    const drawText = (p: any, text: string, x: number, y: number, font: any, size: number, color = rgb(0,0,0)) => {
      p.drawText(text, { x, y, font, size, color })
    }

    const drawHeader = async () => {
      currentY = A4_HEIGHT - MARGIN
      try {
        const logoPath = path.join(process.cwd(), "public", "logo3-min.png")
        if (fs.existsSync(logoPath)) {
          const logoImageBytes = fs.readFileSync(logoPath)
          const logoImage = await pdfDoc.embedPng(logoImageBytes)
          const logoDims = logoImage.scale(0.3)
          page.drawImage(logoImage, {
            x: MARGIN,
            y: currentY - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
          })
        } else {
          drawText(page, "CREATIVE INTERIORS", MARGIN, currentY, helveticaBold, 20)
        }
      } catch (e) {
        drawText(page, "CREATIVE INTERIORS", MARGIN, currentY, helveticaBold, 20)
      }

      currentY -= 30
      drawText(page, "SHOP NO 01 GD TOWER, KHERMAI ROAD SATNA", MARGIN, currentY, helvetica, 10)
      currentY -= 15
      drawText(page, "MADHYA PRADESH PIN 485001", MARGIN, currentY, helvetica, 10)

      drawText(page, "PRODUCT CATALOG", A4_WIDTH - 220, A4_HEIGHT - MARGIN, helveticaBold, 20)
      currentY = A4_HEIGHT - 80
      drawText(page, `Date: ${new Date().toLocaleDateString()}`, A4_WIDTH - 200, currentY, helvetica, 10)

      currentY -= 40
      page.drawLine({ start: { x: MARGIN, y: currentY }, end: { x: A4_WIDTH - MARGIN, y: currentY }, thickness: 1 })
      currentY -= 15
      drawText(page, "S.N", MARGIN, currentY, helveticaBold, 9)
      drawText(page, "CODE", 80, currentY, helveticaBold, 9)
      drawText(page, "PRODUCT NAME", 140, currentY, helveticaBold, 9)
      drawText(page, "SIZE", 340, currentY, helveticaBold, 9)
      drawText(page, "UNIT", 420, currentY, helveticaBold, 9)
      drawText(page, "RATE", 460, currentY, helveticaBold, 9)
      drawText(page, "D.PRICE", 510, currentY, helveticaBold, 9)
      currentY -= 10
      page.drawLine({ start: { x: MARGIN, y: currentY }, end: { x: A4_WIDTH - MARGIN, y: currentY }, thickness: 1 })
      currentY -= 20
    }

    await drawHeader()

    for (let i = 0; i < products.length; i++) {
      const prd = products[i]
      
      if (currentY < MARGIN + 20) {
        page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
        await drawHeader()
      }

      drawText(page, (i + 1).toString(), MARGIN, currentY, helvetica, 9)
      drawText(page, prd.itemCode.substring(0, 10), 80, currentY, helvetica, 9)
      
      const name = prd.name.length > 35 ? prd.name.substring(0, 32) + "..." : prd.name
      drawText(page, name, 140, currentY, helvetica, 9)

      const dims = []
      if (prd.defaultLength) dims.push(prd.defaultLength)
      if (prd.defaultWidth) dims.push(prd.defaultWidth)
      if (prd.defaultHeight) dims.push(prd.defaultHeight)
      
      let dimStr = dims.join("x")
      if (dimStr.length > 15) dimStr = dimStr.substring(0, 15)
      
      drawText(page, dimStr || "-", 340, currentY, helvetica, 9)
      drawText(page, prd.unit, 420, currentY, helvetica, 9)
      drawText(page, prd.sellingRate.toString(), 460, currentY, helvetica, 9)
      drawText(page, prd.dealerPrice ? prd.dealerPrice.toString() : "-", 510, currentY, helvetica, 9)

      currentY -= 20
    }

    page.drawLine({ start: { x: MARGIN, y: currentY }, end: { x: A4_WIDTH - MARGIN, y: currentY }, thickness: 1 })

    const pdfBytes = await pdfDoc.save()

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Product_Catalog_${Date.now()}.pdf`,
      },
    })
  } catch (error) {
    console.error("PDF Generation failed:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
