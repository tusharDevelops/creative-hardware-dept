import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("Clearing database...")
  
  // Delete in order to satisfy foreign key constraints
  const deletedItems = await prisma.quotationItem.deleteMany()
  console.log(`Deleted ${deletedItems.count} quotation items.`)

  const deletedQuotations = await prisma.quotation.deleteMany()
  console.log(`Deleted ${deletedQuotations.count} quotations.`)

  const deletedProducts = await prisma.product.deleteMany()
  console.log(`Deleted ${deletedProducts.count} products.`)

  const deletedCustomers = await prisma.customer.deleteMany()
  console.log(`Deleted ${deletedCustomers.count} customers.`)

  console.log("Database cleared successfully.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
