export default interface ISubscriptionsRepository {
  createSubscription(userId: number, categoryId: number, isSpendingSubscription: boolean): Promise<void>;
  deleteAlertSubscriptions(userId: number, categoryId: number): Promise<void>;
  deleteNotificationSubscriptions(userId: number, categoryId: number): Promise<void>;
}
