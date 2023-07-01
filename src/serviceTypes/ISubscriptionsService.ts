import { User } from '@prisma/client';

export type SubscriptionType = 'notification' | 'alert';

export interface ISubscriptionsService {
  createSubscription(user: User, categoryId: number, isSpendingSubscription: boolean): Promise<void>;
  deleteSubscription(user: User, subscriptionType: SubscriptionType, categoryId: number): Promise<void>;
}
