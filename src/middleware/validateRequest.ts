import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validateRequest = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => issue.message);
      const errorMessage = errors.join(", ");
      return res
        .status(400)
        .json({ Error: "Validation Error", details: errorMessage });
    }

    next();
  };
};
