import client from 'models/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import ISubscriptionsRepository from 'repositoryTypes/ISubscriptionsrepository';

@injectable()
class SubscriptionsRepository implements ISubscriptionsRepository {
  public async createSubscription(userId: number, categoryId: number, isSpendingSubscription: boolean): Promise<void> {
    await client.subscription.create({
      data: {
        isSpendingSubscription,
        user: {
          connect: {
            id: userId,
          },
        },
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  public async deleteNotificationSubscriptions(userId: number, categoryId: number): Promise<void> {
    await client.subscription.deleteMany({
      where: {
        userId,
        isSpendingSubscription: false,
        categoryId,
      },
    });
  }

  public async deleteAlertSubscriptions(userId: number, categoryId: number): Promise<void> {
    await client.subscription.deleteMany({
      where: {
        userId,
        isSpendingSubscription: true,
        categoryId,
      },
    });
  }
}

export default SubscriptionsRepository;
