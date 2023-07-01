import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { requireScopedAuth } from 'middlewares/requiresAuth';
import { validate } from 'middlewares/validate';
import { CreateIncomeRequestSchema } from 'models/requests/incomes/CreateIncomeRequest';
import { DeleteIncomeRequestSchema } from 'models/requests/incomes/DeleteIncomeRequest';
import { GetIncomeRequestSchema } from 'models/requests/incomes/GetIncomeRequest';
import { GetIncomesRequestSchema } from 'models/requests/incomes/GetIncomesRequest';
import { UpdateIncomeRequestSchema } from 'models/requests/incomes/UpdateIncomeRequest';
import 'reflect-metadata';
import { IIncomesService } from 'serviceTypes/IIncomesService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';

@injectable()
class IncomesController {
  public path = '/incomes';
  public incomesRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IIncomesService) private _incomesService: IIncomesService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.incomesRouter.post(
      this.path,
      requireScopedAuth('admin', 'user'),
      validate(CreateIncomeRequestSchema),
      this.createIncome,
    );
    this.incomesRouter.get(
      `${this.path}/:incomeId`,
      requireScopedAuth('admin', 'user'),
      validate(GetIncomeRequestSchema),
      this.getIncome,
    );
    this.incomesRouter.put(
      `${this.path}/:incomeId`,
      requireScopedAuth('admin'),
      validate(UpdateIncomeRequestSchema),
      this.updateIncome,
    );
    this.incomesRouter.delete(
      `${this.path}/:incomeId`,
      requireScopedAuth('admin'),
      validate(DeleteIncomeRequestSchema),
      this.deleteIncome,
    );
    this.incomesRouter.get(
      this.path,
      requireScopedAuth('admin', 'user'),
      validate(GetIncomesRequestSchema),
      this.getIncomes,
    );
  }

  public createIncome = async (req: Request, res: Response) => {
    try {
      const income = await this._incomesService.createIncome(req);

      res.status(201).json({
        message: 'Income created successfully',
        income,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(404).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public updateIncome = async (req: Request, res: Response) => {
    try {
      const income = await this._incomesService.updateIncome(req);

      res.status(200).json({
        message: 'Income updated successfully',
        income,
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(404).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public deleteIncome = async (req: Request, res: Response) => {
    try {
      await this._incomesService.deleteIncome(req);

      res.status(200).json({ message: 'Income deleted successfully' });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(404).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getIncomes = async (req: Request, res: Response) => {
    try {
      const incomes = await this._incomesService.getIncomes(req);
      const totalIncomes = this._incomesService.getTotalIncomes(req);

      const [incomesData, totalIncomesData] = await Promise.all([incomes, totalIncomes]);

      res.status(200).json({
        message: 'Incomes fetched successfully',
        incomes: incomesData,
        totalIncomes: totalIncomesData,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getIncome = async (req: Request, res: Response) => {
    try {
      const income = await this._incomesService.getIncome(req);

      res.status(200).json({
        message: 'Income fetched successfully',
        income,
      });
    } catch (err) {
      console.error(err);

      if (err instanceof ResourceNotFoundError) {
        res.status(404).json({ message: err.message });
        return;
      }

      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default IncomesController;
