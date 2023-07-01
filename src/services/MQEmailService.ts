import { injectable } from 'inversify';
import 'reflect-metadata';

import { BalanceHistory, IEmailService, UpdateType } from 'serviceTypes/IEmailService';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { sqsClient } from 'helpers/sqsClient';

@injectable()
class MQEmailService implements IEmailService {
  private readonly FRONTEND_URL = process.env.FRONTEND_APP_URL ?? 'http://localhost:3000';
  private readonly SQS_QUEUE_URL = process.env.SQS_QUEUE_URL ?? 'http://localhost:4566/000000000000/test';
  private readonly SQS_BALANCE_QUEUE_URL =
    process.env.SQS_BALANCE_QUEUE_URL ?? 'http://localhost:4566/000000000000/test';

  public async sendSpendingLimitAlertEmail(
    email: string,
    category: string,
    limit: number,
    balance: number,
  ): Promise<void> {
    const body = `You have reached the spending limit for category ${category}.\n\nThe limit is ${limit} and the current balance is ${balance}`;

    const params = {
      DelaySeconds: 10,
      MessageAttributes: {
        Receiver: {
          DataType: 'String',
          StringValue: email,
        },
        Subject: {
          DataType: 'String',
          StringValue: 'Spending Limit Alert',
        },
        Body: {
          DataType: 'String',
          StringValue: body,
        },
      },
      MessageBody: JSON.stringify({
        receiver: email,
        subject: 'Spending Limit Alert',
        body: body,
      }),
      QueueUrl: this.SQS_QUEUE_URL,
    };
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('Success, message sent. MessageID:', data.MessageId);
  }

  public async sendCategoryBalanceUpdateEmail(
    email: string,
    category: string,
    data: any,
    updateType: UpdateType,
  ): Promise<void> {
    const body = `The balance for category ${category} has been updated. \n\n${JSON.stringify(data)}`;
    const subject = `Balance update (${updateType}) for category ${category}`;
    const params = {
      DelaySeconds: 10,
      MessageAttributes: {
        Receiver: {
          DataType: 'String',
          StringValue: email,
        },
        Subject: {
          DataType: 'String',
          StringValue: subject,
        },
        Body: {
          DataType: 'String',
          StringValue: body,
        },
      },
      MessageBody: JSON.stringify({
        receiver: email,
        subject: subject,
        body: body,
      }),
      QueueUrl: this.SQS_QUEUE_URL,
    };

    const response = await sqsClient.send(new SendMessageCommand(params));
    console.log('Success, message sent. MessageID:', response.MessageId);
  }

  private renderBalanceTableString(balanceHistory: BalanceHistory[]): string {
    let tableString = '';
    balanceHistory.forEach((history) => {
      tableString += `| ${history.date} | ${history.balance} | ${history.modifiedBy} | \n`;
    });
    return tableString;
  }

  public async sendCurrentBalanceEmail(
    email: string,
    balance: number,
    balanceHistory: BalanceHistory[],
  ): Promise<void> {
    const body = `Your current balance is ${balance}\n\n| Date | Balance | Modified By | \n| --- | --- | --- | \n${this.renderBalanceTableString(
      balanceHistory,
    )}`;

    const params = {
      DelaySeconds: 10,
      MessageAttributes: {
        Receiver: {
          DataType: 'String',
          StringValue: email,
        },
        Subject: {
          DataType: 'String',
          StringValue: 'Current Balance',
        },
        Body: {
          DataType: 'String',
          StringValue: body,
        },
      },
      MessageBody: JSON.stringify({
        receiver: email,
        subject: 'Current Balance',
        body: body,
      }),
      QueueUrl: this.SQS_QUEUE_URL,
    };
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('Success, message sent. MessageID:', data.MessageId);
  }

  private getInviteLink(token: string): string {
    return `${this.FRONTEND_URL} / register ? token = ${token}`;
  }

  private getInviteEmailBody(link: string): string {
    return `You have been invited to join the family.Please click on the link below to register and join the family.\n\n${link}`;
  }

  public async sendInviteEmail(email: string, token: string): Promise<void> {
    const link = this.getInviteLink(token);
    const body = this.getInviteEmailBody(link);

    const params = {
      DelaySeconds: 10,
      MessageAttributes: {
        Receiver: {
          DataType: 'String',
          StringValue: email,
        },
        Subject: {
          DataType: 'String',
          StringValue: 'Family Invite',
        },
        Body: {
          DataType: 'String',
          StringValue: body,
        },
      },
      MessageBody: JSON.stringify({
        receiver: email,
        subject: 'Family Invite',
        body: body,
      }),
      QueueUrl: this.SQS_QUEUE_URL,
    };
    const data = await sqsClient.send(new SendMessageCommand(params));
    console.log('Success, message sent. MessageID:', data.MessageId);
  }
}

export default MQEmailService;
