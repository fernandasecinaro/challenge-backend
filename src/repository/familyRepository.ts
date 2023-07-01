import client from 'models/client';
import { Family, Prisma } from '@prisma/client';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';

@injectable()
class FamilyRepository implements IFamilyRepository {
  public async getByApiKey(apiKey: string): Promise<Family | null> {
    return client.family.findUnique({ where: { apiKey } });
  }

  public async updateFamily(familyId: number, newValues: Prisma.FamilyUpdateInput): Promise<Family> {
    return await client.family.update({ where: { id: familyId }, data: newValues });
  }

  public async findById(familyId: number): Promise<Family> {
    return await client.family.findUniqueOrThrow({ where: { id: familyId } });
  }

  public async createFamily(input: Family): Promise<Family> {
    return client.$queryRaw`
    INSERT INTO Family      (name, apiKey, id, createdAt, updatedAt)    VALUES      (${input.name}, ${input.apiKey}, ${input.id}, ${input.createdAt}, ${input.updatedAt}) 
    `;
  }

  public async findByFamilyName(familyName: string): Promise<Family | null> {
    return await client.family.findUnique({ where: { name: familyName } });
  }
}

export default FamilyRepository;
