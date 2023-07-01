import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { InvalidDataError } from 'errors/InvalidDataError';
import { requireScopedAuth, requiresApiKey } from 'middlewares/requiresAuth';
import { validate } from 'middlewares/validate';
import { AddCategoryRequestSchema } from 'models/requests/categories/AddCategoryRequest';
import 'reflect-metadata';
import { ICategoriesService } from 'serviceTypes/ICategoriesService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import { DeleteCategoryRequestSchema } from 'models/requests/categories/DeleteCategoryRequest';
import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import { UpdateCategoryRequestSchema } from 'models/requests/categories/UpdateCategoryRequestSchema';
import { GetExpensesOfCategoryRequestSchema } from 'models/requests/expenses/GetExpensesOfCategoryRequest';
import { GetCategoriesRequestSchema } from 'models/requests/categories/GetCategoriesRequest';

@injectable()
class CategoryController {
  public path = '/categories';
  public categoriesRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.ICategoriesService) private _categoriesService: ICategoriesService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.categoriesRouter.post(
      this.path,
      requireScopedAuth('admin'),
      validate(AddCategoryRequestSchema),
      this.addCategory,
    );
    this.categoriesRouter.put(
      `${this.path}/:categoryId`,
      requireScopedAuth('admin'),
      validate(UpdateCategoryRequestSchema),
      this.updateCategory,
    );
    this.categoriesRouter.delete(
      `${this.path}/:categoryId`,
      requireScopedAuth('admin'),
      validate(DeleteCategoryRequestSchema),
      this.deleteCategory,
    );
    this.categoriesRouter.get(`${this.path}/ranking`, requiresApiKey, this.getTop3CategoriesWithMoreExpenses);
    this.categoriesRouter.get(
      `${this.path}/:categoryId/expenses`,
      requiresApiKey,
      validate(GetExpensesOfCategoryRequestSchema),
      this.getExpensesOfCategory,
    );
    this.categoriesRouter.get(
      this.path,
      requireScopedAuth('admin', 'user'),
      validate(GetCategoriesRequestSchema),
      this.getCategories,
    );
  }

  public addCategory = async (req: Request, res: Response) => {
    try {
      const categoryAdded = await this._categoriesService.addCategory(req);
      res.status(201).json({
        message: `Category added successfully.`,
        category: categoryAdded,
      });
    } catch (err) {
      if (err instanceof InvalidDataError) {
        res.status(err.code).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public updateCategory = async (req: Request, res: Response) => {
    try {
      await this._categoriesService.updateCategory(req);
      res.status(200).json({
        message: `Category updated successfully.`,
      });
    } catch (err) {
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({ message: err.message });
        return;
      } else if (err instanceof InvalidDataError) {
        res.status(err.code).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public deleteCategory = async (req: Request, res: Response) => {
    try {
      await this._categoriesService.deleteCategory(req);
      res.status(200).json({ message: `Category deleted successfully.` });
    } catch (err) {
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public getTop3CategoriesWithMoreExpenses = async (req: Request, res: Response) => {
    try {
      const categories = await this._categoriesService.getTop3CategoriesWithMoreExpenses(req);
      res.status(200).json({
        message: `Top 3 categories with more expenses fetched successfully`,
        categories: categories,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public getExpensesOfCategory = async (req: Request, res: Response) => {
    try {
      const expenses = await this._categoriesService.getExpensesOfCategory(req);
      res.status(200).json({
        message: `Expenses fetched successfully`,
        expenses: expenses,
      });
    } catch (err) {
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  public getCategories = async (req: Request, res: Response) => {
    try {
      const categories = this._categoriesService.getCategories(req);
      const totalCategories = this._categoriesService.getTotalCategories(req);

      const [categoriesResult, totalCategoriesResult] = await Promise.all([categories, totalCategories]);

      res.status(200).json({
        message: 'Categories fetched successfully',
        categories: categoriesResult,
        totalCategories: totalCategoriesResult,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default CategoryController;
