import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { REPOSITORY_SYMBOLS } from '../repositoryTypes/repositorySymbols';
import { IFamilyService } from 'serviceTypes/IFamilyService';
import { IFamilyRepository } from 'repositoryTypes/IFamilyRepository';
import { Family } from '@prisma/client';

@injectable()
class FamilyService implements IFamilyService {
  public constructor(@inject(REPOSITORY_SYMBOLS.IFamilyRepository) private familyRepository: IFamilyRepository) {}

  public async getFamily(familyId: number): Promise<Family> {
    return await this.familyRepository.findById(familyId);
  }
}

export default FamilyService;
