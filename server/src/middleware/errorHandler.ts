import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { ApiError } from "../lib/errors";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: err.errors.map((e) => e.message).join("; ") } });
  }
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }
  if (err?.code === "P2002") {
    return res.status(409).json({ error: { code: "CONFLICT", message: "Valor duplicado" } });
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "Error interno" } });
}
