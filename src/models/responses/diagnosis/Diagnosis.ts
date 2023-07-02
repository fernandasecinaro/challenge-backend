export interface DiagnosisResponse {
  Issue: {
    ID: number;
    Name: string;
    Accuracy: number;
    Icd: string;
    IcdName: string;
    ProfName: string;
    Ranking: number;
  };
  Specialisation: {
    ID: number;
    Name: string;
    SpecialistID: number;
  }[];
}
