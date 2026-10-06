import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/errors";

export async function listProducts(search?: string) {
  return prisma.product.findMany({
    where: search
      ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { sku: { contains: search, mode: "insensitive" } }, { category: { contains: search, mode: "insensitive" } }] }
      : undefined,
    orderBy: { name: "asc" },
  });
}

export async function getProduct(id: string) {
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) throw new ApiError(404, "NOT_FOUND", "Producto no encontrado");
  return p;
}

export async function createProduct(data: { sku: string; name: string; category: string; price: number; stock: number }) {
  const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existing) throw new ApiError(409, "DUPLICATE_SKU", "El SKU ya existe");
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: { sku?: string; name?: string; category?: string; price?: number; stock?: number }) {
  await getProduct(id);
  if (data.sku) {
    const existing = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existing && existing.id !== id) throw new ApiError(409, "DUPLICATE_SKU", "El SKU ya existe");
  }
  return prisma.product.update({ where: { id }, data });
}
