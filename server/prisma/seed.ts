import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@retailhub.dev" },
    update: {},
    create: {
      email: "admin@retailhub.dev",
      passwordHash: await bcrypt.hash("admin123", 10),
      name: "Admin",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "operator@retailhub.dev" },
    update: {},
    create: {
      email: "operator@retailhub.dev",
      passwordHash: await bcrypt.hash("operator123", 10),
      name: "Operator",
      role: "operator",
    },
  });

  const products = [
    { sku: "SKU-001", name: "Teclado mecánico", category: "Periféricos", price: 89.9, stock: 25 },
    { sku: "SKU-002", name: "Mouse inalámbrico", category: "Periféricos", price: 29.5, stock: 60 },
    { sku: "SKU-003", name: 'Monitor 24"', category: "Monitores", price: 199.0, stock: 12 },
    { sku: "SKU-004", name: "Notebook 14\"", category: "Computadoras", price: 899.0, stock: 5 },
    { sku: "SKU-005", name: "Hub USB-C", category: "Accesorios", price: 45.0, stock: 40 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });
  }

  console.log("Seed OK", { admin: admin.email, products: products.length });
}

main().finally(() => prisma.$disconnect());
