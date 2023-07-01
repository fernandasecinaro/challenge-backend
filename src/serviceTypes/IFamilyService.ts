import { Family } from '@prisma/client';

export interface IFamilyService {
  getFamily(familyId: number): Promise<Family>;
}
