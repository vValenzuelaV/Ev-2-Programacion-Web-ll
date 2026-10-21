import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

interface ValidationTargets {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationTargets) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        const parsedQuery = await schemas.query.parseAsync(req.query);
        
        for (const key of Object.keys(req.query)) {
          delete (req.query as Record<string, any>)[key];
        }
        Object.assign(req.query, parsedQuery);
      }
      if (schemas.params) {
        const parsedParams = await schemas.params.parseAsync(req.params);
        for (const key of Object.keys(req.params)) {
          delete (req.params as Record<string, any>)[key];
        }
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
