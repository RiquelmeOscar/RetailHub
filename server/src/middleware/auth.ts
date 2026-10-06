import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../lib/errors";

export interface AuthRequest extends Request {
  user?: { id: string; role: "admin" | "operator"; email: string };
}

export function auth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next(new ApiError(401, "UNAUTHORIZED", "Token requerido"));
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as any;
    next();
  } catch {
    next(new ApiError(401, "UNAUTHORIZED", "Token inválido"));
  }
}

export function requireRole(...roles: Array<"admin" | "operator">) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "FORBIDDEN", "Sin permisos suficientes"));
    }
    next();
  };
}
