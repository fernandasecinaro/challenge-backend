import { Family, Role, User } from '@prisma/client';
import axios from 'axios';
import { Request, Response } from 'express';
import myContainer from 'factory/inversify.config';
import jwt from 'jsonwebtoken';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';

export interface AuthRequest extends Request {
  user: User;
}

export interface ApiKeyRequest extends Request {
  family: Family;
}

const familyRepository: IFamilyRepository = myContainer.get<IFamilyRepository>(REPOSITORY_SYMBOLS.IFamilyRepository);

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

export const requireScopedAuth =
  (...acceptedUserTypes: Role[]) =>
  async (req: Request, res: Response, next: any) => {
    const authorization = req.header('Authorization');
    const token = authorization ? authorization.replace('Bearer ', '') : null;
    const secret = process.env.JWT_SECRET;
    const authUrl = process.env.AUTH_SERVICE_URL;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    if (!token) {
      return res.status(401).json({ message: 'A token is required for auth' });
    }

    try {
      const { data: decoded } = await axios.get(`${authUrl}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isNotAuthorizedUserType = !acceptedUserTypes.includes(decoded.user.role);
      if (isNotAuthorizedUserType) {
        return res.status(403).json({ message: 'You are not authorized to access this resource' });
      }

      (req as AuthRequest).user = decoded.user;
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'There was an error verifying the token' });
    }
    return next();
  };

export const requiresApiKey = async (req: Request, res: Response, next: any) => {
  const apiKey = req.header('X-Api-Key');

  if (!apiKey) {
    return res.status(401).json({ message: 'An API KEY is required' });
  }

  try {
    const family = await familyRepository.getByApiKey(apiKey);

    if (!family) {
      return res.status(401).json({ message: 'Invalid API KEY' });
    }

    (req as ApiKeyRequest).family = family;
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'There was an error verifying the token' });
  }
  return next();
};
