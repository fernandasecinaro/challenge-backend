import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { requiresAuth } from 'middlewares/requiresAuth';
import 'reflect-metadata';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import ISymptomsService from 'serviceTypes/ISymptomsService';

@injectable()
class SymptomsController {
  public path = '/symptoms';
  public symptomsRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.ISymptomsService) private _symptomsService: ISymptomsService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.symptomsRouter.get(this.path, requiresAuth, this.getSymptoms);
  }

  public getSymptoms = async (_req: Request, res: Response) => {
    try {
      const symptoms = await this._symptomsService.getSymptoms();

      res.status(200).json({
        message: 'Symptoms fetched successfully',
        symptoms,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default SymptomsController;
