import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../lib/errors";

export async function createOrder(userId: string, items: Array<{ productId: string; quantity: number }>) {
  return prisma.$transaction(async (tx) => {
    let total = new Prisma.Decimal(0);
    const orderItems: Array<{ productId: string; quantity: number; unitPrice: Prisma.Decimal }> = [];

    for (const item of items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new ApiError(404, "NOT_FOUND", `Producto no encontrado: ${item.productId}`);
      orderItems.push({ productId: product.id, quantity: item.quantity, unitPrice: product.price });
      total = total.plus(product.price.mul(item.quantity));
    }

    return tx.order.create({
      data: { userId, total, items: { create: orderItems } },
      include: { items: { include: { product: true } } },
    });
  });
}

export async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
  });
  if (!order) throw new ApiError(404, "NOT_FOUND", "Orden no encontrada");
  return order;
}

export async function listOrders() {
  return prisma.order.findMany({
    include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function confirmOrder(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new ApiError(404, "NOT_FOUND", "Orden no encontrada");
    if (order.status !== "PENDING") throw new ApiError(409, "INVALID_STATE", "Solo órdenes PENDING pueden confirmarse");

    for (const item of order.items) {
      const res = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (res.count === 0) throw new ApiError(409, "INSUFFICIENT_STOCK", `Stock insuficiente para el producto ${item.productId}`);
      await tx.inventoryMovement.create({
        data: { productId: item.productId, userId, type: "OUT", quantity: item.quantity },
      });
    }

    return tx.order.update({ where: { id }, data: { status: "CONFIRMED" }, include: { items: { include: { product: true } } } });
  });
}

export async function cancelOrder(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new ApiError(404, "NOT_FOUND", "Orden no encontrada");
    if (order.status === "CANCELLED") throw new ApiError(409, "INVALID_STATE", "La orden ya está cancelada");

    if (order.status === "CONFIRMED") {
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({
          data: { productId: item.productId, userId, type: "IN", quantity: item.quantity },
        });
      }
    }

    return tx.order.update({ where: { id }, data: { status: "CANCELLED" }, include: { items: { include: { product: true } } } });
  });
}
