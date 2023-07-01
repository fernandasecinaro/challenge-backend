import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { User } from '@prisma/client';
import { IBalancesService } from 'serviceTypes/IBalancesService';
import Queue from 'bull';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';
import { IIncomesRepository } from 'repositoryTypes/IIncomesRepository';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';
import { IEmailService } from 'serviceTypes/IEmailService';
import { GetBalanceRequest } from 'models/requests/balances/GetBalanceRequest';

const queue = new Queue('balance', process.env.REDIS_URL ?? '');

@injectable()
class BalancesService implements IBalancesService {
  public constructor(
    @inject(REPOSITORY_SYMBOLS.IExpensesRepository) private expensesRepository: IExpensesRepository,
    @inject(REPOSITORY_SYMBOLS.IIncomesRepository) private incomesRepository: IIncomesRepository,
    @inject(SERVICE_SYMBOLS.IEmailService) private emailsService: IEmailService,
  ) {}

  public async getBalance(user: User, request: GetBalanceRequest): Promise<void> {
    const { query } = request;
    const { from, to } = query;
    queue.add({ user, from, to });
  }
}

export default BalancesService;
