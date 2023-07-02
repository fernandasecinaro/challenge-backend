import { injectable } from 'inversify';
import 'reflect-metadata';
import IDiagnosisService from 'serviceTypes/IDiagnosisService';
import axios from 'axios';
import { DiagnosisResponse } from 'models/responses/diagnosis/Diagnosis';
import { AuthRequest } from 'middlewares/requiresAuth';

@injectable()
class DiagnosisService implements IDiagnosisService {
  private authServiceUrl = process.env.API_MEDIC_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });

  public async getDiagnosis(req: AuthRequest): Promise<DiagnosisResponse[]> {
    const {
      user: { gender, dateOfBirth },
      query: { symptoms },
    } = req;
    try {
      const { data } = await this.axiosInstance.get(
        `/diagnosis?symptoms=${symptoms}&gender=${gender}&year_of_birth=${new Date(dateOfBirth).getFullYear()}&token=${
          process.env.API_MEDIC_TOKEN
        }&format=json&language=en-gb`,
      );
      return data;
    } catch (_error: any) {
      console.error(_error.message);
      throw new Error('There was an error while fetching symptoms');
    }
  }
}

export default DiagnosisService;
