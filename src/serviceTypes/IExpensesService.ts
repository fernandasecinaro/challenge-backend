import { Expense, User } from '@prisma/client';
import { Request } from 'express';
import { CreateExpenseRequest } from 'models/requests/expenses/CreateExpenseRequest';
import { GetExpensesRequest } from 'models/requests/expenses/GetExpensesRequest';
import { UpdateExpenseRequest } from 'models/requests/expenses/UpdateExpenseRequest';
import { ExpenseDTO } from 'models/responses/ExpenseDTO';
import { ExpensePerCategoryDTO } from 'models/responses/ExpensesPerCategoryDTO';

export interface IExpensesService {
  getExpenses(requestData: GetExpensesRequest, user: User): Promise<ExpenseDTO[]>;
  getTotalExpenses(requestData: GetExpensesRequest, user: User): Promise<number>;
  getExpensesPerCategory(requestData: Request): Promise<ExpensePerCategoryDTO[]>;
  getExpense(expenseId: number, user: User): Promise<Expense | null>;
  createExpense(requestData: CreateExpenseRequest, user: User): Promise<ExpenseDTO>;
  updateExpense(requestData: UpdateExpenseRequest, user: User): Promise<void>;
  deleteExpense(expenseId: number, user: User): Promise<Expense>;
}
