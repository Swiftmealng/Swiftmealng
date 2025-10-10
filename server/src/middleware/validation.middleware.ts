import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/AppError";

const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
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
