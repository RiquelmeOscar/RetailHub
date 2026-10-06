import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/errors";

export async function createMovement(userId: string, data: { productId: string; type: "IN" | "OUT"; quantity: number }) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new ApiError(404, "NOT_FOUND", "Producto no encontrado");

    if (data.type === "OUT") {
      const res = await tx.product.updateMany({
        where: { id: data.productId, stock: { gte: data.quantity } },
        data: { stock: { decrement: data.quantity } },
      });
      if (res.count === 0) throw new ApiError(409, "INSUFFICIENT_STOCK", "Stock insuficiente");
    } else {
      await tx.product.update({ where: { id: data.productId }, data: { stock: { increment: data.quantity } } });
    }

    return tx.inventoryMovement.create({
      data: { productId: data.productId, userId, type: data.type, quantity: data.quantity },
    });
  });
}

export async function listMovements() {
  return prisma.inventoryMovement.findMany({
    include: { product: { select: { sku: true, name: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}
