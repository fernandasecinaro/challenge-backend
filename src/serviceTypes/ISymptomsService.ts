import { Symptom } from 'models/responses/symptoms/Symptom';

export default interface ISymptomsService {
  getSymptoms(): Promise<Symptom[]>;
}
