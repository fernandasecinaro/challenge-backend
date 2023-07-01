import { InvalidDataError } from 'errors/InvalidDataError';
import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { validate } from 'middlewares/validate';
import { RegisterAdminRequestSchema } from 'models/requests/register/RegisterAdminRequest';
import 'reflect-metadata';
import { IUsersService } from 'serviceTypes/IUsersService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';

@injectable()
class UsersController {
  public path = '/users';
  public usersRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IUsersService) private _usersService: IUsersService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.usersRouter.post(this.path, validate(RegisterAdminRequestSchema), this.registerAdmin);
  }

  public registerAdmin = async (req: Request, res: Response) => {
    try {
      const { body } = req;
      await this._usersService.registerAdmin({ body });
      res.status(201).json({
        message: 'Admin registered successfully',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof InvalidDataError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default UsersController;
