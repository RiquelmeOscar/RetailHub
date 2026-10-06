import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { ApiError, asyncHandler } from "../lib/errors";
import { auth, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Credenciales inválidas");
  }
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET!, { expiresIn: "8h" });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}));

router.get("/me", auth, asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new ApiError(404, "NOT_FOUND", "Usuario no encontrado");
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}));

export default router;
