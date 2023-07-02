import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import axios from 'axios';
import {
  Diagnosis,
  DiagnosisConfirmation,
  DiagnosisHistory,
  DiagnosisResponse,
} from 'models/responses/diagnosis/Diagnosis';
import { AuthRequest } from 'middlewares/requiresAuth';
import { REPOSITORY_SYMBOLS } from 'repositoryTypes/repositorySymbols';
import { IDiagnosesRepository } from 'repositoryTypes/IDiagnosesRepository';
import { InvalidDataError } from 'errors/InvalidDataError';

@injectable()
class DiagnosisService implements IDiagnosisService {
  private authServiceUrl = process.env.API_MEDIC_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });

  public constructor(
    @inject(REPOSITORY_SYMBOLS.IDiagnosesRepository) private diagnosesRepository: IDiagnosesRepository,
  ) {}

  public async getDiagnosis(req: AuthRequest): Promise<Diagnosis[]> {
    const {
      user: { gender, dateOfBirth, id: userId },
      body: { symptoms },
    } = req;

    try {
      const { data: diagnoses }: { data: DiagnosisResponse[] } = await this.axiosInstance.get(
        `/diagnosis?symptoms=${symptoms}&gender=${gender}&year_of_birth=${new Date(dateOfBirth).getFullYear()}&token=${
          process.env.API_MEDIC_TOKEN
        }&format=json&language=en-gb`,
      );
      await this.saveDiagnoses(diagnoses, userId);
      return diagnoses.length > 0
        ? diagnoses.map((diagnosis: DiagnosisResponse) => {
            const {
              Issue: { ID: issueId, Name, Accuracy },
            } = diagnosis;

            return {
              issueId,
              name: Name,
              accuracy: Accuracy,
            };
          })
        : [];
    } catch (_error: any) {
      console.error(_error.message);
      throw new Error('There was an error while fetching symptoms');
    }
  }

  private async saveDiagnoses(diagnoses: DiagnosisResponse[], userId: number): Promise<void> {
    const diagnosesToSave = diagnoses.length
      ? diagnoses.map((diagnosis) => {
          const {
            Issue: { ID: issueId, Name, Accuracy },
          } = diagnosis;

          return {
            issueId,
            name: Name,
            accuracy: Accuracy,
            userId,
          };
        })
      : [];

    diagnosesToSave.length > 0 && (await this.diagnosesRepository.saveDiagnoses(diagnosesToSave));
  }

  public async getDiagnosesHistory(req: AuthRequest): Promise<DiagnosisHistory[]> {
    const {
      user: { id: userId },
    } = req;

    return await this.diagnosesRepository.getDiagnosesHistory(userId);
  }

  public async changeDiagnosisConfirmation(req: AuthRequest): Promise<DiagnosisConfirmation> {
    const {
      user: { id: userId },
      params: { diagnosisId },
      body: { confirmed },
    } = req;

    await this.checkDiagnosesBelongsToUser(diagnosisId, userId);

    const {
      id,
      confirmed: newConfirmationValue,
      name,
    } = await this.diagnosesRepository.updateDiagnosisConfirmation(+diagnosisId, confirmed);

    return {
      id: id,
      confirmed: newConfirmationValue,
      name,
    };
  }

  private async checkDiagnosesBelongsToUser(diagnosisId: string, userId: number) {
    const diagnosis = await this.diagnosesRepository.getDiagnosisById(+diagnosisId);
    if (!diagnosis || diagnosis.userId !== userId) {
      throw new InvalidDataError('Diagnosis does not belong to the user');
    }
  }
}

export default DiagnosisService;
