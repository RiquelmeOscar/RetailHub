import { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function asyncHandler(fn: (req: any, res: Response, next: NextFunction) => Promise<any>) {
  return (req: any, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);
}
