import { Category, Prisma } from '@prisma/client';
import { CategoryDTO } from 'models/responses/CategoryDTO';
import { Top3CategoryWithMoreExpenses } from 'models/responses/Top3CategoryWithMoreExpenses';

export interface ICategoryRepository {
  getTop3CategoriesWithMoreExpenses(familyId: number): Promise<Top3CategoryWithMoreExpenses[]>;
  findMany(params: Prisma.CategoryFindManyArgs): Promise<CategoryDTO[]>;
  categoryExistsInFamily(categoryName: string, familyId: number): Promise<boolean>;
  createCategory(category: Prisma.CategoryCreateInput): Promise<CategoryDTO>;
  updateCategory(categoryId: number, newData: Prisma.CategoryCreateInput): Promise<void>;
  deleteCategory(categoryId: number): Promise<void>;
  findById(categoryId: number): Promise<Category | null>;
  getFamilyCategoriesQuantity(familyId: number): Promise<number>;
}
