import { User } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user: User;
}

export const requiresAuth = async (req: Request, res: Response, next: any) => {
  const authorization = req.header('Authorization');
  const token = authorization ? authorization.replace('Bearer ', '') : null;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  if (!token) {
    return res.status(401).json({ message: 'A token is required for auth' });
  }

  try {
    const decoded = jwt.verify(token, secret) as any;

    (req as AuthRequest).user = decoded.user;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'There was an error verifying the token' });
  }
  return next();
};
