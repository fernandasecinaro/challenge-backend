import { User } from '@prisma/client';
import Queue from 'bull';
import dayjs from 'dayjs';
import myContainer from 'factory/inversify.config';
import { CategoryDTO } from 'models/responses/CategoryDTO';
import { ICategoryRepository } from 'repositoryTypes/ICategoriesRepository';
import { IExpensesRepository } from 'repositoryTypes/IExpensesRepository';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IEmailService } from 'serviceTypes/IEmailService';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';

export const SPENDING_LIMIT_QUEUE_NAME = 'spending-limit';

const queue = new Queue(SPENDING_LIMIT_QUEUE_NAME, process.env.REDIS_URL ?? '');
const calculateBalance = async (job: Queue.Job, done: any) => {
  const expensesRepository = myContainer.get<IExpensesRepository>(REPOSITORY_SYMBOLS.IExpensesRepository);
  const categoriesRepository = myContainer.get<ICategoryRepository>(REPOSITORY_SYMBOLS.ICategoriesRepository);

  const { user, categoryId } = job.data;
  const from = dayjs().startOf('month').toISOString();
  const to = dayjs().endOf('month').toISOString();

  console.log('Calculating balance for user', user.id);
  const castedUser = user as User;
  const expenses = await expensesRepository.getExpensesOfOneCategory({
    where: {
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
      category: {
        familyId: castedUser.familyId,
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
  });
  const sortedTransactions = expenses.sort((a, b) => a.date.getTime() - b.date.getTime());

  let balance = 0;

  sortedTransactions.forEach((transaction) => {
    balance += +transaction.amount as number;
  });

  const category = await categoriesRepository.findById(categoryId);
  if (!category) {
    done();
    return;
  }

  const hasReachedSpendingLimit = balance >= category?.monthlySpendingLimit;
  if (hasReachedSpendingLimit) {
    await sendLimitAlerts(category, balance);
  }

  done();
};

queue.process(calculateBalance);
queue.on('error', (err) => {
  console.log(err.message);
});

queue.on('success', (job, result) => {
  console.log('Job completed with result', job.id);
});

const sendLimitAlerts = async (category: CategoryDTO, balance: number) => {
  const emailsService = myContainer.get<IEmailService>(SERVICE_SYMBOLS.IEmailService);
  const usersRepository = myContainer.get<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository);
  const spendingSubscriptions = category?.subscriptions?.filter((subscription) => subscription.isSpendingSubscription);
  const usersWithSpendingLimitNotificationActive = await Promise.all(
    spendingSubscriptions?.map((subscription) => usersRepository.getUserById(subscription.userId)) ?? [],
  );

  await Promise.all(
    usersWithSpendingLimitNotificationActive?.map((user) => {
      emailsService.sendSpendingLimitAlertEmail(
        user?.email ?? '',
        category.name,
        category.monthlySpendingLimit,
        balance,
      );
    }),
  );
};
