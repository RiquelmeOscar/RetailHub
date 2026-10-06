import { Router } from "express";
import { z } from "zod";
import { auth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../lib/errors";
import * as products from "../services/products";

const router = Router();
router.use(auth);

const productSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
});

router.get("/", asyncHandler(async (req, res) => {
  res.json(await products.listProducts(req.query.search as string | undefined));
}));

router.get("/:id", asyncHandler(async (req, res) => {
  res.json(await products.getProduct(req.params.id));
}));

router.post("/", requireRole("admin"), asyncHandler(async (req, res) => {
  res.status(201).json(await products.createProduct(productSchema.parse(req.body)));
}));

router.patch("/:id", requireRole("admin"), asyncHandler(async (req, res) => {
  res.json(await products.updateProduct(req.params.id, productSchema.partial().parse(req.body)));
}));

export default router;
