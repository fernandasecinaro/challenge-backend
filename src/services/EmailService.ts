import { injectable } from 'inversify';
import 'reflect-metadata';

import { IEmailService, UpdateType } from 'serviceTypes/IEmailService';
import emailClient from 'helpers/EmailClient';

@injectable()
class EmailService implements IEmailService {
  sendSpendingLimitAlertEmail(email: string, category: string, limit: number, balance: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendCurrentBalanceEmail(email: string, balance: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendCategoryBalanceUpdateEmail(email: string, category: string, data: any, type: UpdateType): Promise<void> {
    throw new Error('Method not implemented.');
  }
  private readonly FRONTEND_URL = process.env.FRONTEND_APP_URL ?? 'http://localhost:3000';

  private getInviteLink(token: string): string {
    return `${this.FRONTEND_URL}/register?token=${token}`;
  }

  private getInviteEmailBody(link: string): string {
    return `You have been invited to join the family. Please click on the link below to register and join the family. \n\n${link}`;
  }

  public async sendInviteEmail(email: string, token: string): Promise<void> {
    const link = this.getInviteLink(token);
    const body = this.getInviteEmailBody(link);

    const emailJobPayload = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Family Invite',
      text: body,
    };

    emailClient
      .sendMail(emailJobPayload)
      .then(() => console.log(`Invite email sent to ${email}`))
      .catch((error) => console.error(error));
  }
}

export default EmailService;
