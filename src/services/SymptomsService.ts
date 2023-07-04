import { injectable } from 'inversify';
import 'reflect-metadata';
import ISymptomsService from 'serviceTypes/ISymptomsService';
import { Symptom } from 'models/responses/symptoms/Symptom';
import axios from 'axios';
import { generateToken } from 'utils/generateToken';

@injectable()
class SymptomsService implements ISymptomsService {
  private authServiceUrl = process.env.API_MEDIC_HEALTH_URL;
  private axiosInstance = axios.create({
    baseURL: this.authServiceUrl,
  });

  public async getSymptoms(): Promise<Symptom[]> {
    const token = generateToken();

    try {
      const response = await axios.post(`${process.env.API_MEDIC_AUTH_URL}/login`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { Token } = response.data;

      const { data } = await this.axiosInstance.get(`/symptoms?token=${Token}&format=json&language=en-gb`);
      return data;
    } catch (error: any) {
      console.error(error.message);
      throw new Error('There was an error while fetching symptoms');
    }
  }
}

export default SymptomsService;
