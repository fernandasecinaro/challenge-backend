import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { Income, User } from '@prisma/client';
import { IIncomesService } from 'serviceTypes/IIncomesService';
import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import { ICategoryRepository } from 'repositoryTypes/ICategoriesRepository';
import { AuthRequest } from 'middlewares/requiresAuth';
import { IncomeDTO } from 'models/responses/IncomeDTO';
import { IIncomesRepository } from 'repositoryTypes/IIncomesRepository';
import { sendExpenseUpdateMiddleware } from 'helpers/sendExpenseUpdateMiddleware';

@injectable()
class IncomesService implements IIncomesService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.IIncomesRepository) private incomesRepository: IIncomesRepository,
    @inject(REPOSITORY_SYMBOLS.ICategoriesRepository) private categoriesRepository: ICategoryRepository,
  ) {}

  private async checkCategoryExistsAndIsInFamily(categoryId: number, familyId: number): Promise<boolean> {
    const category = await this.categoriesRepository.findById(categoryId);

    const isNotCategoryInFamily = !category || category.familyId !== familyId;
    if (isNotCategoryInFamily) throw new ResourceNotFoundError('Category not found');

    return true;
  }

  private async checkIncomeIsInFamily(incomeId: number, familyId: number): Promise<boolean> {
    const isIncomeInFamily = await this.incomesRepository.isIncomeInFamily(incomeId, familyId);

    if (!isIncomeInFamily) throw new ResourceNotFoundError('Income not found');

    return true;
  }

  public async createIncome(request: AuthRequest): Promise<IncomeDTO> {
    const {
      body: { amount, date, categoryId, description },
      user: { familyId, id: userId },
    } = request;

    await this.checkCategoryExistsAndIsInFamily(categoryId, familyId);

    const response = await this.incomesRepository.createIncome({
      amount,
      description,
      date: new Date(date),
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: { id: userId },
      },
    });
    return await sendExpenseUpdateMiddleware(response, request.user, 'income');
  }

  public async updateIncome(request: AuthRequest): Promise<void> {
    const {
      body: { amount, date, categoryId, description },
      params: { incomeId },
      user: { familyId },
    } = request;

    await this.checkIncomeIsInFamily(+incomeId, familyId);
    categoryId && (await this.checkCategoryExistsAndIsInFamily(categoryId, familyId));

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

    await this.incomesRepository.updateIncome(+incomeId, newValues);
  }

  public async deleteIncome(request: AuthRequest): Promise<Income> {
    const {
      params: { incomeId },
      user: { familyId },
    } = request;

    await this.checkIncomeIsInFamily(+incomeId, familyId);
    return await this.incomesRepository.deleteIncome(+incomeId);
  }

  public async getIncomes(request: AuthRequest): Promise<IncomeDTO[]> {
    const {
      query: { from, to, skip, take },
      user: { familyId },
    } = request as AuthRequest & { user: User; query: { from: string; to: string; skip: number; take: number } };

    const incomes = await this.incomesRepository.findMany({
      where: {
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        category: {
          familyId: familyId,
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

    return incomes;
  }

  public async getTotalIncomes(request: AuthRequest): Promise<number> {
    const {
      query: { from, to },
      user: { familyId },
    } = request as AuthRequest & { user: User; query: { from: string | undefined; to: string | undefined } };
    return await this.incomesRepository.getTotalIncomes(from, to, familyId);
  }

  public async getIncome(request: AuthRequest): Promise<Income | null> {
    const {
      params: { incomeId },
      user: { familyId },
    } = request;
    await this.checkIncomeIsInFamily(+incomeId, familyId);
    const income = await this.incomesRepository.findById(+incomeId);

    if (!income) throw new ResourceNotFoundError('Income not found');

    return income;
  }
}

export default IncomesService;
