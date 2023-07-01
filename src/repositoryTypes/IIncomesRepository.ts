import { Income, Prisma } from '@prisma/client';
import { IncomeDTO } from 'models/responses/IncomeDTO';

export interface IIncomesRepository {
  findMany(params: Prisma.IncomeFindManyArgs): Promise<IncomeDTO[]>;
  getTotalIncomes(from: string | undefined, to: string | undefined, familyId: number): Promise<number>;
  createIncome(incomesData: Prisma.IncomeCreateInput): Promise<IncomeDTO>;
  updateIncome(incomeId: number, newValues: Prisma.IncomeUpdateInput): Promise<void>;
  deleteIncome(incomeId: number): Promise<Income>;
  findById(id: number): Promise<Income | null>;
  isIncomeInFamily(incomeId: number, familyId: number): Promise<boolean>;
  getIncomes(familyId: number, from?: string, to?: string): Promise<IncomeDTO[]>;
}
