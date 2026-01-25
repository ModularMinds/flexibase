import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateResource =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        res.status(400).json({
          isSuccess: false,
          err: e.issues,
        });
        return;
      }
      next(e);
    }
  };
