import express from 'express';
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { requiresAuth } from 'middlewares/requiresAuth';
import 'reflect-metadata';
import { SERVICE_SYMBOLS } from '../serviceTypes/serviceSymbols';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import { validate } from 'middlewares/validate';
import { GetDiagnosisRequestSchema } from 'models/requests/diagnosis/DiagnosisRequest';
import { UpdateDiagnosisConfirmationRequestSchema } from 'models/requests/diagnosis/UpdateDiagnosisConfirmation';

@injectable()
class DiagnosesController {
  public path = '/diagnoses';
  public diagnosisRouter = express.Router();

  public constructor(@inject(SERVICE_SYMBOLS.IDiagnosisService) private _diagnosesService: IDiagnosisService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.diagnosisRouter.post(this.path, requiresAuth, validate(GetDiagnosisRequestSchema), this.getDiagnosis);
    this.diagnosisRouter.get(this.path, requiresAuth, this.getDiagnosesHistory);
    this.diagnosisRouter.put(
      `${this.path}/:diagnosisId`,
      requiresAuth,
      validate(UpdateDiagnosisConfirmationRequestSchema),
      this.changeDiagnosisConfirmation,
    );
  }

  public getDiagnosis = async (req: Request, res: Response) => {
    try {
      const diagnoses = await this._diagnosesService.getDiagnosis(req);

      res.status(200).json({
        message: 'Diagnoses fetched successfully',
        diagnoses,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public getDiagnosesHistory = async (req: Request, res: Response) => {
    try {
      const diagnosesHistory = await this._diagnosesService.getDiagnosesHistory(req);

      res.status(200).json({
        message: 'Diagnoses history fetched successfully',
        diagnosesHistory,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  public changeDiagnosisConfirmation = async (req: Request, res: Response) => {
    try {
      const diagnosis = await this._diagnosesService.changeDiagnosisConfirmation(req);

      res.status(200).json({
        message: 'Diagnoses confirmation changed successfully',
        diagnosis,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}

export default DiagnosesController;
