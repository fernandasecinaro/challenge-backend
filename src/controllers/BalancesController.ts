import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthRequest, requireScopedAuth } from 'middlewares/requiresAuth';
import { validate } from 'middlewares/validate';
import { GetBalanceRequestSchema } from 'models/requests/balances/GetBalanceRequest';
import 'reflect-metadata';
import { IBalancesService } from 'serviceTypes/IBalancesService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';

@injectable()
class BalancesController {
  public path = '/balances';
  public balancesRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IBalancesService) private balancesService: IBalancesService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.balancesRouter.get(
      this.path,
      requireScopedAuth('admin', 'user'),
      validate(GetBalanceRequestSchema),
      this.getBalance,
    );
  }

  public getBalance = async (req: Request, res: Response) => {
    try {
      const { user, query } = req as AuthRequest;
      await this.balancesService.getBalance(user, { query });

      res.status(201).json({
        message: 'You will receive an email with your balance shortly',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default BalancesController;
