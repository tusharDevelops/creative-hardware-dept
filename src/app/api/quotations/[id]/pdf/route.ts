import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import fs from "fs"
import path from "path"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.quotation.findUnique({
      where: { id },
      include: { customer: true, items: true }
    })

    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89]) // A4 Size
    const { width, height } = page.getSize()

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    // Helper for text
    const drawText = (text: string, x: number, y: number, font: any, size: number, color = rgb(0,0,0)) => {
      page.drawText(text, { x, y, font, size, color })
    }

    // Try embedding Logo
    let currentY = height - 50
    try {
      const logoPath = path.join(process.cwd(), "public", "logo3-min.png")
      if (fs.existsSync(logoPath)) {
        const logoImageBytes = fs.readFileSync(logoPath)
        const logoImage = await pdfDoc.embedPng(logoImageBytes)
        const logoDims = logoImage.scale(0.3)
        page.drawImage(logoImage, {
          x: 50,
          y: currentY - logoDims.height,
          width: logoDims.width,
          height: logoDims.height,
        })
        // Adjust Y based on logo
      } else {
        drawText("CREATIVE INTERIORS", 50, currentY, helveticaBold, 20)
      }
    } catch (e) {
      drawText("CREATIVE INTERIORS", 50, currentY, helveticaBold, 20)
    }

    // Company details
    currentY -= 30
    drawText("SHOP NO 01 GD TOWER, KHERMAI ROAD SATNA", 50, currentY, helvetica, 10)
    currentY -= 15
    drawText("MADHYA PRADESH PIN 485001", 50, currentY, helvetica, 10)

    // Quotation Title
    drawText("QUOTATION", width - 150, height - 50, helveticaBold, 20)
    currentY = height - 80
    drawText(`Quote No: ${quote.quotationNumber}`, width - 200, currentY, helveticaBold, 10)
    currentY -= 15
    drawText(`Date: ${new Date(quote.quotationDate).toLocaleDateString()}`, width - 200, currentY, helvetica, 10)

    // Customer details
    currentY -= 40
    drawText("Bill To:", 50, currentY, helveticaBold, 12)
    currentY -= 15
    drawText(quote.customer.name, 50, currentY, helveticaBold, 11)
    currentY -= 15
    drawText(`Mobile: ${quote.customer.mobile}`, 50, currentY, helvetica, 10)
    if (quote.customer.address) {
      currentY -= 15
      drawText(quote.customer.address.substring(0, 50), 50, currentY, helvetica, 10)
    }
    if (quote.customer.gstNumber) {
      currentY -= 15
      drawText(`GSTIN: ${quote.customer.gstNumber}`, 50, currentY, helvetica, 10)
    }

    // Table Header
    currentY -= 40
    page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1 })
    currentY -= 15
    drawText("S.NO", 50, currentY, helveticaBold, 10)
    drawText("ITEM DESCRIPTION", 100, currentY, helveticaBold, 10)
    drawText("QTY", 320, currentY, helveticaBold, 10)
    drawText("UNIT", 380, currentY, helveticaBold, 10)
    drawText("RATE", 440, currentY, helveticaBold, 10)
    drawText("AMOUNT", 500, currentY, helveticaBold, 10)
    currentY -= 10
    page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1 })

    // Items
    currentY -= 20
    quote.items.forEach((item, index) => {
      drawText((index + 1).toString(), 50, currentY, helvetica, 10)
      
      let displayName = item.productName
      const dims = []
      if (item.length) dims.push(item.length)
      if (item.width) dims.push(item.width)
      if (item.height) dims.push(item.height)
      
      if (dims.length > 0) {
        let dimStr = dims.join("x")
        if (item.pieces) dimStr += ` x ${item.pieces} SHT`
        displayName += ` (${dimStr})`
      } else if (item.pieces && item.pieces !== item.quantity) {
        displayName += ` (${item.pieces} PCS)`
      }

      // Basic text wrapping for product name
      const name = displayName.length > 35 ? displayName.substring(0, 32) + "..." : displayName
      drawText(name, 100, currentY, helvetica, 10)
      drawText(item.quantity.toString(), 320, currentY, helvetica, 10)
      drawText(item.unit, 380, currentY, helvetica, 10)
      drawText(item.rate.toString(), 440, currentY, helvetica, 10)
      drawText(item.amount.toString(), 500, currentY, helvetica, 10)
      currentY -= 20

      if (currentY < 150) {
        // Just very basic pagination, skip for now in minimal version
      }
    })

    // Totals
    page.drawLine({ start: { x: 50, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1 })
    currentY -= 20
    drawText("Subtotal:", 380, currentY, helveticaBold, 10)
    drawText(quote.subtotal.toString(), 500, currentY, helvetica, 10)
    
    if (quote.discount > 0) {
      currentY -= 15
      drawText("Discount:", 380, currentY, helveticaBold, 10)
      drawText(`-${quote.discount}`, 500, currentY, helvetica, 10)
    }
    if (quote.gst > 0) {
      currentY -= 15
      drawText("GST:", 380, currentY, helveticaBold, 10)
      drawText(quote.gst.toString(), 500, currentY, helvetica, 10)
    }
    if (quote.transportCharge > 0) {
      currentY -= 15
      drawText("Transport:", 380, currentY, helveticaBold, 10)
      drawText(quote.transportCharge.toString(), 500, currentY, helvetica, 10)
    }

    currentY -= 15
    page.drawLine({ start: { x: 380, y: currentY }, end: { x: width - 50, y: currentY }, thickness: 1 })
    currentY -= 15
    drawText("GRAND TOTAL:", 380, currentY, helveticaBold, 12)
    drawText(`Rs. ${quote.grandTotal}`, 500, currentY, helveticaBold, 12)

    // Terms
    currentY = 100
    drawText("Terms & Conditions:", 50, currentY, helveticaBold, 10)
    currentY -= 15
    drawText("1. Goods once sold will not be taken back.", 50, currentY, helvetica, 8)
    currentY -= 12
    drawText("2. Subject to Satna jurisdiction.", 50, currentY, helvetica, 8)

    drawText("Authorized Signature", width - 150, 50, helveticaBold, 10)

    const pdfBytes = await pdfDoc.save()

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${quote.quotationNumber}.pdf`,
      },
    })
  } catch (error) {
    console.error("PDF Generation failed:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
