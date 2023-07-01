import client from 'models/client';
import { Income, Prisma } from '@prisma/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IIncomesRepository } from 'repositoryTypes/IIncomesRepository';
import { IncomeDTO } from 'models/responses/IncomeDTO';

@injectable()
class IncomesRepository implements IIncomesRepository {
  public async getIncomes(familyId: number, from?: string, to?: string): Promise<IncomeDTO[]> {
    const incomes = await client.income.findMany({
      where: {
        category: {
          familyId,
        },
        deleted: null,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      select: {
        id: true,
        amount: true,
        date: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return incomes;
  }
  public async createIncome(incomeData: Prisma.IncomeCreateInput): Promise<IncomeDTO> {
    return await client.income.create({
      data: incomeData,
      select: {
        id: true,
        amount: true,
        date: true,
        description: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  public async updateIncome(incomeId: number, newValues: Prisma.IncomeUpdateInput): Promise<void> {
    const { category } = newValues;
    category
      ? await this.updateIncomeWithCategory(incomeId, newValues)
      : await this.updateIncomeWithoutCategory(incomeId, newValues);
  }

  private async updateIncomeWithoutCategory(incomeId: number, newValues: Prisma.IncomeUpdateInput): Promise<void> {
    const { amount, date, description } = newValues;
    await client.$executeRaw`
      UPDATE Income
      SET amount = ${amount}, date = ${date}, description = ${description}
      WHERE id = ${incomeId}
    `;
  }

  private async updateIncomeWithCategory(incomeId: number, newValues: Prisma.IncomeUpdateInput): Promise<void> {
    const { amount, date, description, category } = newValues;
    await client.$executeRaw`
      UPDATE Income
      SET amount = ${amount}, date = ${date}, description = ${description}, categoryId = ${category?.connect?.id}
      WHERE id = ${incomeId}
    `;
  }

  public async findById(id: number): Promise<Income | null> {
    return await client.income.findFirst({ where: { id } });
  }

  public async deleteIncome(incomeId: number): Promise<Income> {
    return await client.income.delete({ where: { id: incomeId } });
  }

  public async getTotalIncomes(from: string | undefined, to: string | undefined, familyId: number): Promise<number> {
    const incomesQuantity = await client.income.count({
      where: {
        category: { familyId: familyId },
        deleted: null,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
    });
    return incomesQuantity;
  }

  public async isIncomeInFamily(incomeId: number, familyId: number): Promise<boolean> {
    const income = await client.income.findFirst({
      where: {
        id: incomeId,
        category: {
          family: {
            id: familyId,
          },
        },
      },
    });
    return !!income;
  }

  public async findMany(params: Prisma.IncomeFindManyArgs): Promise<IncomeDTO[]> {
    const incomes = await client.income.findMany(params);
    return incomes;
  }
}

export default IncomesRepository;
