import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/AppError";

const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;
      
      // Update req.body with validated (and potentially transformed) data
      // Note: req.query and req.params are read-only, so we only update body
      if (validated.body) {
        req.body = validated.body;
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        throw new ValidationError(messages.join(". "));
      }
      next(error);
    }
  };
};

export default validate;
