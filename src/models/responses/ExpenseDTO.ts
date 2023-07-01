import { Decimal } from '@prisma/client/runtime';

interface CategoryInternalDTO {
  id: number;
  name: string;
}

export interface ExpenseDTO {
  id: number;
  amount: Decimal;
  date: Date;
  description: string;
  category?: CategoryInternalDTO;
}
