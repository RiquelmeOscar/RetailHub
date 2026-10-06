import { Router } from "express";
import { z } from "zod";
import { auth, AuthRequest, requireRole } from "../middleware/auth";
import { asyncHandler } from "../lib/errors";
import * as orders from "../services/orders";

const router = Router();
router.use(auth, requireRole("admin", "operator"));

router.post("/", asyncHandler(async (req: AuthRequest, res) => {
  const { items } = z
    .object({
      items: z
        .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() }))
        .min(1),
    })
    .parse(req.body);
  res.status(201).json(await orders.createOrder(req.user!.id, items));
}));

router.get("/", asyncHandler(async (_req, res) => {
  res.json(await orders.listOrders());
}));

router.get("/:id", asyncHandler(async (req, res) => {
  res.json(await orders.getOrder(req.params.id));
}));

router.post("/:id/confirm", asyncHandler(async (req: AuthRequest, res) => {
  res.json(await orders.confirmOrder(req.params.id, req.user!.id));
}));

router.post("/:id/cancel", asyncHandler(async (req: AuthRequest, res) => {
  res.json(await orders.cancelOrder(req.params.id, req.user!.id));
}));

export default router;
