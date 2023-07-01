import { Income } from '@prisma/client';
import { IncomeDTO } from 'models/responses/IncomeDTO';
import { Request } from 'express';

export interface IIncomesService {
  getIncomes(request: Request): Promise<IncomeDTO[]>;
  getTotalIncomes(request: Request): Promise<number>;
  getIncome(request: Request): Promise<Income | null>;
  createIncome(request: Request): Promise<IncomeDTO>;
  updateIncome(request: Request): Promise<void>;
  deleteIncome(request: Request): Promise<Income>;
}
