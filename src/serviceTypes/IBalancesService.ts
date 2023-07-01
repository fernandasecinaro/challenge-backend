import { User } from '@prisma/client';
import { GetBalanceRequest } from 'models/requests/balances/GetBalanceRequest';

export interface IBalancesService {
  getBalance(user: User, request: GetBalanceRequest): Promise<void>;
}
