import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const products = await prisma.product.findMany({
    select: { unit: true },
    distinct: ['unit']
  })
  console.log("Distinct units in DB:", products)
}

main().catch(console.error).finally(() => prisma.$disconnect())
