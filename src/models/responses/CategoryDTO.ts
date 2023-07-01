import { Subscription } from '@prisma/client';

export interface CategoryDTO {
  id: number;
  name: string;
  description: string;
  monthlySpendingLimit: number;
  image: string;
  createdAt: Date;
  subscriptions?: Subscription[];
  hasAlertsActivated?: boolean;
  hasNotificationsActivated?: boolean;
}
