import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { Expense, User } from '@prisma/client';
import { IExpensesService } from 'serviceTypes/IExpensesService';
import { CreateExpenseRequest } from 'models/requests/expenses/CreateExpenseRequest';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';
import { UpdateExpenseRequest } from 'models/requests/expenses/UpdateExpenseRequest';
import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import { ICategoryRepository } from 'repositoryTypes/ICategoriesRepository';
import { ExpenseDTO } from 'models/responses/ExpenseDTO';
import { GetExpensesRequest } from 'models/requests/expenses/GetExpensesRequest';
import { ExpensePerCategoryDTO } from 'models/responses/ExpensesPerCategoryDTO';
import { AuthRequest } from 'middlewares/requiresAuth';
import { sendExpenseUpdateMiddleware } from 'helpers/sendExpenseUpdateMiddleware';

@injectable()
class ExpensesService implements IExpensesService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.IExpensesRepository) private expensesRepository: IExpensesRepository,
    @inject(REPOSITORY_SYMBOLS.ICategoriesRepository) private categoriesRepository: ICategoryRepository,
  ) {}

  private async checkCategoryExistsAndIsInFamily(categoryId: number, familyId: number): Promise<boolean> {
    const category = await this.categoriesRepository.findById(categoryId);

    const isNotCategoryInFamily = !category || category.familyId !== familyId;
    if (isNotCategoryInFamily) throw new ResourceNotFoundError('Category not found');

    return true;
  }

  private async checkExpenseIsInFamily(expenseId: number, familyId: number): Promise<boolean> {
    const isExpenseInFamily = await this.expensesRepository.isExpenseInFamily(expenseId, familyId);

    if (!isExpenseInFamily) throw new ResourceNotFoundError('Expense not found');

    return true;
  }

  public async createExpense(requestData: CreateExpenseRequest, user: User): Promise<ExpenseDTO> {
    const { body } = requestData;
    const { amount, date, categoryId, description } = body;

    await this.checkCategoryExistsAndIsInFamily(categoryId, user.familyId);

    const response = await this.expensesRepository.createExpense({
      amount,
      description,
      date: new Date(date),
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: { id: user.id },
      },
    });

    return await sendExpenseUpdateMiddleware(response, user, 'expense');
  }

  public async updateExpense(requestData: UpdateExpenseRequest, user: User): Promise<void> {
    const { body, params } = requestData;
    const { expenseId } = params;
    const { amount, date, categoryId, description } = body;

    await this.checkExpenseIsInFamily(expenseId, user.familyId);
    categoryId && (await this.checkCategoryExistsAndIsInFamily(categoryId, user.familyId));

    const newValues = {
      amount,
      description,
      date: date ? new Date(date) : undefined,
      category: categoryId
        ? {
            connect: {
              id: categoryId,
            },
          }
        : undefined,
    };

    await this.expensesRepository.updateExpense(expenseId, newValues);
  }

  public async deleteExpense(expenseId: number, user: User): Promise<Expense> {
    await this.checkExpenseIsInFamily(expenseId, user.familyId);
    return await this.expensesRepository.deleteExpense(expenseId);
  }

  public async getExpenses(requestData: GetExpensesRequest, user: User): Promise<ExpenseDTO[]> {
    const { query } = requestData;
    const { from, to, skip, take } = query;

    const expenses = await this.expensesRepository.findMany({
      where: {
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        category: {
          familyId: user.familyId,
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
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });

    return expenses;
  }

  public async getTotalExpenses(requestData: GetExpensesRequest, user: User): Promise<number> {
    const { familyId } = user;
    const {
      query: { from, to },
    } = requestData;
    return await this.expensesRepository.getTotalExpenses(from, to, familyId);
  }

  public async getExpense(expenseId: number, user: User): Promise<Expense | null> {
    await this.checkExpenseIsInFamily(expenseId, user.familyId);
    const expense = await this.expensesRepository.findById(expenseId);

    if (!expense) throw new ResourceNotFoundError('Expense not found');

    return expense;
  }

  public async getExpensesPerCategory(req: AuthRequest): Promise<ExpensePerCategoryDTO[]> {
    const {
      user: { familyId },
      query: { from, to },
    } = req as AuthRequest & { query: { from: string; to: string }; user: { familyId: number } };

    const ExpensesPerCategory: ExpensePerCategoryDTO[] = await this.expensesRepository.getExpensesPerCategory(
      familyId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );

    return ExpensesPerCategory;
  }
}

export default ExpensesService;
