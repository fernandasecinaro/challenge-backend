import { InvalidDataError } from 'errors/InvalidDataError';
import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { validate } from 'middlewares/validate';
import { LoginRequestSchema } from 'models/requests/auth/LoginRequest';
import 'reflect-metadata';
import IAuthService from 'serviceTypes/IAuthService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';

@injectable()
class AuthController {
  public path = '/auth';
  public authRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IAuthService) private _authService: IAuthService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.authRouter.post(this.path + '/login', validate(LoginRequestSchema), this.login);
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
}

export default AuthController;
