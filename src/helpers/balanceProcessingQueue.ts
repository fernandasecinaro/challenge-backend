import { User } from '@prisma/client';
import Queue from 'bull';
import myContainer from 'factory/inversify.config';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';
import { IIncomesRepository } from 'repositoryTypes/IIncomesRepository';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IEmailService, BalanceHistory } from 'serviceTypes/IEmailService';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';

const queue = new Queue('balance', process.env.REDIS_URL ?? '');
const calculateBalance = async (job: Queue.Job, done: any) => {
  const incomesRepository = myContainer.get<IIncomesRepository>(REPOSITORY_SYMBOLS.IIncomesRepository);
  const expensesRepository = myContainer.get<IExpensesRepository>(REPOSITORY_SYMBOLS.IExpensesRepository);
  const emailsService = myContainer.get<IEmailService>(SERVICE_SYMBOLS.IEmailService);

  const { user, from, to } = job.data;
  console.log('Calculating balance for user', user.id);
  const castedUser = user as User;
  const expenses = (await expensesRepository.getExpenses(castedUser.familyId, from, to)).map((expense) => ({
    ...expense,
    amount: -expense.amount,
  }));
  const incomes = await incomesRepository.getIncomes(castedUser.familyId, from, to);

  const transactions = [...expenses, ...incomes];
  const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

  let balance = 0;
  const balanceHistory: BalanceHistory[] = [];

  sortedTransactions.forEach((transaction) => {
    balance += +transaction.amount as number;
    balanceHistory.push({
      date: transaction.date,
      modifiedBy: `${transaction.amount}`,
      balance,
    });
  });

  await emailsService.sendCurrentBalanceEmail(castedUser.email, balance, balanceHistory);

  done();
};

queue.process(calculateBalance);
queue.on('error', (err) => {
  console.log(err.message);
});

queue.on('success', (job, result) => {
  console.log('Job completed with result', job.id);
});
