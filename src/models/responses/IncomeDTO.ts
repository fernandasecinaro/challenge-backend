import { Decimal } from '@prisma/client/runtime';

interface CategoryInternalDTO {
  id: number;
  name: string;
}

export interface IncomeDTO {
  id: number;
  amount: Decimal;
  date: Date;
  description: string;
  category?: CategoryInternalDTO;
}
