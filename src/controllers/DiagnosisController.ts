import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { requiresAuth } from 'middlewares/requiresAuth';
import 'reflect-metadata';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import { validate } from 'middlewares/validate';
import { GetDiagnosisRequestSchema } from 'models/requests/diagnosis/DiagnosisRequest';

@injectable()
class DiagnosisController {
  public path = '/diagnosis';
  public diagnosisRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IDiagnosisService) private _diagnosisService: IDiagnosisService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.diagnosisRouter.get(this.path, requiresAuth, validate(GetDiagnosisRequestSchema), this.getDiagnosis);
  }

  public getDiagnosis = async (req: Request, res: Response) => {
    try {
      const diagnosis = await this._diagnosisService.getDiagnosis(req);

      res.status(200).json({
        message: 'Diagnosis fetched successfully',
        diagnosis,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default DiagnosisController;
