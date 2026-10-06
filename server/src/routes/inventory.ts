import { Router } from "express";
import { z } from "zod";
import { auth, AuthRequest, requireRole } from "../middleware/auth";
import { asyncHandler } from "../lib/errors";
import * as inventory from "../services/inventory";

const router = Router();
router.use(auth, requireRole("admin", "operator"));

router.post("/movements", asyncHandler(async (req: AuthRequest, res) => {
  const data = z
    .object({ productId: z.string().min(1), type: z.enum(["IN", "OUT"]), quantity: z.number().int().positive() })
    .parse(req.body);
  res.status(201).json(await inventory.createMovement(req.user!.id, data));
}));

router.get("/movements", asyncHandler(async (_req, res) => {
  res.json(await inventory.listMovements());
}));

export default router;
