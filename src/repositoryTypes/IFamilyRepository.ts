import { Family, Prisma } from '@prisma/client';

export interface IFamilyRepository {
  getByApiKey(apiKey: string): Promise<Family | null>;
  findByFamilyName(familyName: string): Promise<Family | null>;
  findById(familyId: number): Promise<Family>;
  createFamily(input: Family): Promise<Family>;
  updateFamily(familyId: number, newValues: Prisma.FamilyUpdateInput): Promise<Family>;
}
