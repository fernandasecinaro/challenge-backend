import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  const data = await schema.safeParseAsync(req);

  if (data.success) {
    return next();
  }

  return res.status(400).json({
    message: data.error.errors[0].message,
  });
};
