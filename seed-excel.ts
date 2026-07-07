import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function main() {
  const workbook = XLSX.readFile('data tushar.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { range: 2 }) as any[];

  console.log(`Read ${data.length} rows from Excel`);

  const productsToCreate = [];

  let count = 0;
  for (const row of data) {
    const normalizedRow: Record<string, any> = {};
    for (const key of Object.keys(row)) {
      normalizedRow[key.trim().toUpperCase()] = row[key];
    }

    const name = normalizedRow['MATERIAL'];
    if (!name) continue;

    const brand = normalizedRow['COMPANY'] || null;
    const dpRaw = normalizedRow['DP'];
    const rateRaw = normalizedRow['RATE'];
    const unit = normalizedRow['PER SQF/PC'] || 'PCS';

    const sellingRate = typeof rateRaw === 'number' ? rateRaw : parseFloat(rateRaw);
    const dealerPrice = typeof dpRaw === 'number' ? dpRaw : (dpRaw ? parseFloat(dpRaw) : null);

    if (isNaN(sellingRate)) continue;

    productsToCreate.push({
      itemCode: `PRD-${Date.now()}-${count}`,
      name: String(name).trim(),
      brand: brand ? String(brand).trim() : null,
      unit: String(unit).trim(),
      sellingRate,
      dealerPrice: isNaN(dealerPrice as number) ? null : dealerPrice,
    });
    count++;
  }
  
  console.log(`Prepared ${productsToCreate.length} products to insert.`);
  
  // Clear existing products to prevent duplicates (optional, but good for seeding)
  // await prisma.product.deleteMany({});
  
  // Insert in chunks
  const chunkSize = 500;
  let inserted = 0;
  
  for (let i = 0; i < productsToCreate.length; i += chunkSize) {
    const chunk = productsToCreate.slice(i, i + chunkSize);
    await prisma.product.createMany({
      data: chunk,
      skipDuplicates: true
    });
    inserted += chunk.length;
    console.log(`Inserted ${inserted} / ${productsToCreate.length}`);
  }

  console.log(`Done seeding ${inserted} products.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
