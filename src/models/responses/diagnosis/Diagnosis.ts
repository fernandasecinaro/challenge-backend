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

export interface Diagnosis {
  issueId: number;
  name: string;
  accuracy: number;
}

export interface DiagnosisHistory {
  issueId: number;
  name: string;
  accuracy: number;
  id: number;
  confirmed: boolean;
  date: Date;
}

export interface DiagnosisConfirmation {
  name: string;
  id: number;
  confirmed: boolean;
}
