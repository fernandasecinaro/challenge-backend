export type UpdateType = 'expense' | 'income';
export interface BalanceHistory {
  date: Date;
  balance: number;
  modifiedBy: string;
}
export interface IEmailService {
  sendInviteEmail(email: string, token: string): Promise<void>;
  sendCategoryBalanceUpdateEmail(email: string, category: string, data: any, type: UpdateType): Promise<void>;
  sendCurrentBalanceEmail(email: string, balance: number, balanceHistory: BalanceHistory[]): Promise<void>;
  sendSpendingLimitAlertEmail(email: string, category: string, limit: number, balance: number): Promise<void>;
}
