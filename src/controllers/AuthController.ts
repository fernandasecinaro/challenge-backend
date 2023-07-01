import { InvalidDataError } from 'errors/InvalidDataError';
import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { validate } from 'middlewares/validate';
import { LoginRequestSchema } from 'models/requests/auth/LoginRequest';
import 'reflect-metadata';
import IAuthService from 'serviceTypes/IAuthService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import { User } from '@prisma/client';
import { requireScopedAuth } from 'middlewares/requiresAuth';

@injectable()
class AuthController {
  public path = '/auth';
  public authRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IAuthService) private _authService: IAuthService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.authRouter.post(this.path + '/login', validate(LoginRequestSchema), this.login);
    this.authRouter.put(this.path + '/api-key', requireScopedAuth('admin'), this.refreshApiKey);
    this.authRouter.get(this.path + '/api-key', requireScopedAuth('admin', 'user'), this.getApiKey);
    this.authRouter.get(this.path + '/users', requireScopedAuth('admin', 'user'), this.getUser);
  }

  public login = async (req: Request, res: Response) => {
    try {
      const { body } = req;
      const token = await this._authService.login({ body });
      res.status(200).json({
        token,
        message: 'Login successful',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof InvalidDataError) {
        res.status(err.code).json({ message: 'Email or password is incorrect' });
        return;
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public refreshApiKey = async (req: Request, res: Response) => {
    try {
      const { user } = req as Request & { user: User };
      const { familyId } = user;
      const apiKey = await this._authService.refreshApiKey(familyId);
      res.status(200).json({
        apiKey,
        message: 'Refresh successful',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getApiKey = async (req: Request, res: Response) => {
    try {
      const { user } = req as Request & { user: User };
      const { familyId } = user;
      const apiKey = await this._authService.getApiKey(familyId);
      res.status(200).json({
        apiKey,
        message: 'Get successful',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getUser = async (req: Request, res: Response) => {
    try {
      const {
        user: { email, name, role },
      } = req as Request & { user: User };
      res.status(200).json({
        user: {
          email: email,
          name: name,
          role: role,
        },
        message: 'Role fetched successful',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default AuthController;
