import client from 'models/client';
import { Expense, Prisma } from '@prisma/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';
import { ExpenseDTO } from 'models/responses/ExpenseDTO';
import { ExpensePerCategoryDTO } from 'models/responses/ExpensesPerCategoryDTO';
import redisClient from 'models/redisClient';

@injectable()
class ExpensesRepository implements IExpensesRepository {
  public async getExpenses(familyId: number, from?: string, to?: string): Promise<ExpenseDTO[]> {
    const expenses = await client.expense.findMany({
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
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return expenses;
  }
  public async createExpense(expenseData: Prisma.ExpenseCreateInput): Promise<ExpenseDTO> {
    return await client.expense.create({
      data: expenseData,
      select: {
        id: true,
        amount: true,
        date: true,
        description: true,
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  public async updateExpense(expenseId: number, newValues: Prisma.ExpenseUpdateInput): Promise<void> {
    const { category } = newValues;
    category
      ? await this.updateExpenseWithCategory(expenseId, newValues)
      : await this.updateExpenseWithoutCategory(expenseId, newValues);
  }

  private async updateExpenseWithoutCategory(expenseId: number, newValues: Prisma.ExpenseUpdateInput): Promise<void> {
    const { amount, date, description } = newValues;
    await client.$executeRaw`
      UPDATE Expense
      SET amount = ${amount}, date = ${date}, description = ${description}
      WHERE id = ${expenseId}
    `;
  }

  private async updateExpenseWithCategory(expenseId: number, newValues: Prisma.ExpenseUpdateInput): Promise<void> {
    const { amount, date, description, category } = newValues;
    await client.$executeRaw`
      UPDATE Expense
      SET amount = ${amount}, date = ${date}, description = ${description}, categoryId = ${category?.connect?.id}
      WHERE id = ${expenseId}
    `;
  }

  public async findById(id: number): Promise<Expense | null> {
    return await client.expense.findFirst({ where: { id } });
  }

  public async deleteExpense(expenseId: number): Promise<Expense> {
    return await client.expense.delete({ where: { id: expenseId } });
  }

  public async getTotalExpenses(from: Date, to: Date, familyId: number): Promise<number> {
    const expensesQuantity = await client.expense.count({
      where: {
        category: { familyId: familyId },
        deleted: null,
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
    });
    return expensesQuantity;
  }

  public async isExpenseInFamily(expenseId: number, familyId: number): Promise<boolean> {
    const expense = await client.expense.findFirst({
      where: {
        id: expenseId,
        category: {
          family: {
            id: familyId,
          },
        },
      },
    });
    return !!expense;
  }

  public async findMany(params: Prisma.ExpenseFindManyArgs): Promise<ExpenseDTO[]> {
    const expenses = await client.expense.findMany(params);
    return expenses;
  }

  public async getExpensesOfOneCategory(params: Prisma.ExpenseFindManyArgs): Promise<ExpenseDTO[]> {
    const { where, skip, take } = params;
    const { gte, lte } = this.getLteGteFromWhereQuery(where);

    const cacheKey = `expenses-${where?.categoryId}-${gte}-${lte}-${skip}-${take}`;

    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const expenses = await client.expense.findMany(params);

    await redisClient.set(cacheKey, JSON.stringify(expenses), {
      EX: 60 * 3,
    });

    return expenses;
  }

  private getLteGteFromWhereQuery(where: Prisma.ExpenseWhereInput | undefined) {
    const gte = typeof where?.date == 'string' || where?.date instanceof Date ? where.date : where?.date?.gte;
    const lte = typeof where?.date == 'string' || where?.date instanceof Date ? where.date : where?.date?.lte;
    return { gte, lte };
  }

  public async getExpensesPerCategory(
    familyId: number,
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<ExpensePerCategoryDTO[]> {
    const expensesPerCategory: ExpensePerCategoryDTO[] = await client.$queryRaw`
      SELECT
        category.id,
        category.name,
        SUM(expense.amount) AS totalAmount
      FROM
        Expense as expense
      INNER JOIN Category as category ON expense.categoryId = category.id
      WHERE
        category.familyId = ${familyId}
        AND category.deleted IS NULL
        AND expense.deleted IS NULL
        AND expense.date >= ${from || '1900-01-01'}
        AND expense.date <= ${to || '2100-01-01'}
      GROUP BY
        category.id
    `;

    return expensesPerCategory;
  }
}

export default ExpensesRepository;
