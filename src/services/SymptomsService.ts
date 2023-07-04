import { injectable } from 'inversify';
import 'reflect-metadata';
import ISymptomsService from 'serviceTypes/ISymptomsService';
import { Symptom } from 'models/responses/symptoms/Symptom';
import axios from 'axios';

@injectable()
class SymptomsService implements ISymptomsService {
  private authServiceUrl = process.env.API_MEDIC_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });

  public async getSymptoms(): Promise<Symptom[]> {
    try {
      const { data } = await this.axiosInstance.get(
        `/symptoms?token=${process.env.API_MEDIC_TOKEN}&format=json&language=en-gb`,
      );
      return data;
    } catch (error: any) {
      console.error(error.message);
      throw new Error('There was an error while fetching symptoms');
    }
  }
}

export default SymptomsService;
