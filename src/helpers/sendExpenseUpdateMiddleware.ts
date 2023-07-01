import { Subscription, User } from '@prisma/client';
import myContainer from 'factory/inversify.config';
import { IUsersRepository } from 'repositoryTypes/IUsersRepository';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IEmailService, UpdateType } from 'serviceTypes/IEmailService';
import { SERVICE_SYMBOLS } from 'serviceTypes/serviceSymbols';
import Queue from 'bull';
import { SPENDING_LIMIT_QUEUE_NAME } from './categorySpendingLimitControlProcessingQueue';
import { ICategoryRepository } from 'repositoryTypes/ICategoriesRepository';
import { CategoryDTO } from 'models/responses/CategoryDTO';

const queue = new Queue(SPENDING_LIMIT_QUEUE_NAME, process.env.REDIS_URL ?? 'redis://');

export async function sendExpenseUpdateMiddleware<T>(
  response: T & { category?: { id: number } },
  user: User,
  type: UpdateType,
) {
  const category = (await getCategory(response.category?.id ?? 0)) as CategoryDTO;

  const usersWithSubscriptions = new Set<number>(category.subscriptions?.map((sub) => sub.userId));

  usersWithSubscriptions?.forEach((userId) => {
    processUserNotifications(userId, response, type);
  });

  return response;
}

const loadSubscriptions = async (userId: number): Promise<User & { subscriptions: Subscription[] }> => {
  const usersRepository = myContainer.get<IUsersRepository>(REPOSITORY_SYMBOLS.IUsersRepository);
  return (await usersRepository.getUserById(userId)) as User & { subscriptions: Subscription[] };
};

const getCategory = async (categoryId: number) => {
  const categoriesRepository = myContainer.get<ICategoryRepository>(REPOSITORY_SYMBOLS.ICategoriesRepository);
  return categoriesRepository.findById(categoryId);
};

const processUserNotifications = async (userId: number, response: any, type: UpdateType) => {
  const user = await loadSubscriptions(userId);
  const isSubscribed = user.subscriptions.some(
    (sub) => sub.categoryId === response.category?.id && !sub.isSpendingSubscription,
  );
  const needsToCheckSpendingLimit =
    type === 'expense' &&
    user.subscriptions.some((sub) => sub.categoryId === response.category?.id && sub.isSpendingSubscription);

  if (isSubscribed) {
    const emailService = myContainer.get<IEmailService>(SERVICE_SYMBOLS.IEmailService);
    await emailService.sendCategoryBalanceUpdateEmail(user.email, type, response, type);
  }

  console.log('Needs to check spending limit', needsToCheckSpendingLimit);

  if (needsToCheckSpendingLimit) {
    queue.add({ user: user, categoryId: response.category?.id });
  }
};
