import { ResourceNotFoundError } from 'errors/ResourceNotFoundError';
import express, { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { AuthRequest, requireScopedAuth } from 'middlewares/requiresAuth';
import { validate } from 'middlewares/validate';
import { DeleteSubscriptionRequestSchema } from 'models/requests/subscriptions/DeleteSubscriptionRequest';
import { NewSubscriptionRequestSchema } from 'models/requests/subscriptions/NewSubscriptionRequest';
import 'reflect-metadata';
import { ISubscriptionsService } from 'serviceTypes/ISubscriptionsService';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';

@injectable()
class SubscriptionsController {
  public path = '/subscriptions';
  public subscriptionsRouter = express.Router();

  public constructor(
    @inject(SERVICE_SYMBOLS.ISubscriptionsService) private _subscriptionsService: ISubscriptionsService,
  ) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.subscriptionsRouter.post(
      this.path + '/alerts',
      requireScopedAuth('admin'),
      validate(NewSubscriptionRequestSchema),
      this.createAlertSubscription,
    );
    this.subscriptionsRouter.post(
      this.path + '/notifications',
      requireScopedAuth('admin'),
      validate(NewSubscriptionRequestSchema),
      this.createNotificationSubscription,
    );
    this.subscriptionsRouter.delete(
      this.path + '/alerts',
      requireScopedAuth('admin'),
      validate(DeleteSubscriptionRequestSchema),
      this.deleteAlertSubscription,
    );
    this.subscriptionsRouter.delete(
      this.path + '/notifications',
      requireScopedAuth('admin'),
      validate(DeleteSubscriptionRequestSchema),
      this.deleteNotificationSubscription,
    );
  }

  public createAlertSubscription = async (req: Request, res: Response) => {
    try {
      const { body, user } = req as AuthRequest;
      const { categoryId } = body;
      await this._subscriptionsService.createSubscription(user, categoryId, true);

      res.status(201).json({
        message: 'Subscription created successfully',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public createNotificationSubscription = async (req: Request, res: Response) => {
    try {
      const { body, user } = req as AuthRequest;
      const { categoryId } = body;
      await this._subscriptionsService.createSubscription(user, categoryId, false);

      res.status(201).json({
        message: 'Subscription created successfully',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public deleteAlertSubscription = async (req: Request, res: Response) => {
    try {
      const { user, query } = req as AuthRequest;

      const { categoryId } = query;
      await this._subscriptionsService.deleteSubscription(user, 'alert', +(categoryId as string));

      res.status(200).json({
        message: 'Subscription deleted successfully',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public deleteNotificationSubscription = async (req: Request, res: Response) => {
    try {
      const { user, query } = req as AuthRequest;
      const { categoryId } = query;
      await this._subscriptionsService.deleteSubscription(user, 'notification', +(categoryId as string));

      res.status(200).json({
        message: 'Subscription deleted successfully',
      });
    } catch (err) {
      console.error(err);
      if (err instanceof ResourceNotFoundError) {
        res.status(err.code).json({
          message: err.message,
        });
        return;
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default SubscriptionsController;
