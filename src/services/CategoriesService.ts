import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { ICategoriesService } from 'serviceTypes/ICategoriesService';
import { ICategoryRepository } from 'repositoryTypes/ICategoriesRepository';
import { ApiKeyRequest, AuthRequest } from 'middlewares/requiresAuth';
import { InvalidDataError } from 'errors/InvalidDataError';
import { CategoryDTO } from 'models/responses/CategoryDTO';
import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import { Category, Family } from '@prisma/client';
import { Top3CategoryWithMoreExpenses } from 'models/responses/Top3CategoryWithMoreExpenses';
import { ExpenseDTO } from 'models/responses/ExpenseDTO';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';

@injectable()
class CategoriesService implements ICategoriesService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.ICategoriesRepository) private categoriesRepository: ICategoryRepository,
    @inject(REPOSITORY_SYMBOLS.IExpensesRepository) private expensesRepository: IExpensesRepository,
  ) {}

  public async addCategory(req: AuthRequest): Promise<CategoryDTO> {
    const {
      body: { name, description, monthlySpendingLimit, image },
      user: { familyId },
    } = req;
    await this.checkIfCategoryNameExistsInFamily(name, familyId);
    const category = {
      name,
      description,
      monthlySpendingLimit,
      image: image,
      family: {
        connect: {
          id: familyId,
        },
      },
    };

    const categoryAdded = await this.categoriesRepository.createCategory(category);
    return categoryAdded;
  }

  private async checkIfCategoryNameExistsInFamily(categoryName: string, familyId: number): Promise<void> {
    const categoryExists = await this.categoriesRepository.categoryExistsInFamily(categoryName, familyId);
    if (categoryExists) {
      throw new InvalidDataError('Category already exists in family');
    }
  }

  public async updateCategory(req: AuthRequest): Promise<void> {
    const {
      params: { categoryId },
      user: { familyId },
      body,
    } = req;

    await this.checkCategoryCouldBeUpdated(categoryId, body.name, familyId);
    await this.categoriesRepository.updateCategory(+categoryId, body);
  }

  private async checkCategoryCouldBeUpdated(categoryId: string, newName: string, familyId: number) {
    const categoryToUpdate = await this.checkCategoryIsInFamily(+categoryId, familyId);
    newName && categoryToUpdate.name !== newName && (await this.checkIfCategoryNameExistsInFamily(newName, familyId));
  }

  public async deleteCategory(req: AuthRequest): Promise<void> {
    const {
      params: { categoryId },
      user: { familyId },
    } = req;
    await this.checkCategoryIsInFamily(+categoryId, familyId);
    await this.categoriesRepository.deleteCategory(+categoryId);
  }

  private async checkCategoryIsInFamily(categoryId: number, familyId: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(categoryId);
    const isNotCategoryInFamily = !category || category.familyId !== familyId;
    if (isNotCategoryInFamily) throw new ResourceNotFoundError('Category not found');
    return category;
  }

  public async getTop3CategoriesWithMoreExpenses(req: ApiKeyRequest): Promise<Top3CategoryWithMoreExpenses[]> {
    const {
      family: { id: familyId },
    } = req as ApiKeyRequest & { family: Family };

    return await this.categoriesRepository.getTop3CategoriesWithMoreExpenses(familyId);
  }

  public async getExpensesOfCategory(req: ApiKeyRequest): Promise<ExpenseDTO[]> {
    const {
      family: { id: familyId },
      query: { from, to, skip, take },
      params: { categoryId },
    } = req as ApiKeyRequest & { family: Family } & { query: { from: string; to: string; skip: string; take: string } };

    await this.checkCategoryIsInFamily(+categoryId, familyId);

    const expenses = await this.expensesRepository.getExpensesOfOneCategory({
      where: {
        date: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        category: {
          familyId: familyId,
          id: +categoryId,
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

  public async getCategories(req: AuthRequest): Promise<CategoryDTO[]> {
    const {
      user: { familyId },
      query: { skip, take },
    } = req;

    const categories: CategoryDTO[] = await this.categoriesRepository.findMany({
      where: {
        familyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        monthlySpendingLimit: true,
        image: true,
        subscriptions: true,
      },
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });

    categories.forEach((category) => {
      const userSubscriptions = category.subscriptions?.filter((subscription) => subscription.userId === req.user.id);
      category.hasAlertsActivated = userSubscriptions?.some((subscription) => subscription.isSpendingSubscription);
      category.hasNotificationsActivated = userSubscriptions?.some(
        (subscription) => !subscription.isSpendingSubscription,
      );
      delete category.subscriptions;
    });

    return categories;
  }

  public async getTotalCategories(req: AuthRequest): Promise<number> {
    const {
      user: { familyId },
    } = req;

    const totalCategories = await this.categoriesRepository.getFamilyCategoriesQuantity(familyId);

    return totalCategories;
  }
}

export default CategoriesService;
