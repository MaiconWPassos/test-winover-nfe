import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  NFE_REPOSITORY,
  type INfeRepository,
} from '../domain/ports/nfe.repository.port';
import { toNfeStatusApiView } from '../domain/mappers/nfe-api.mapper';

@Injectable()
export class GetNfeStatusUseCase {
  constructor(
    @Inject(NFE_REPOSITORY) private readonly nfeRepository: INfeRepository,
  ) {}

  async execute(userId: string, id: string) {
    const nfe = await this.nfeRepository.findByIdForUser(id, userId);
    if (!nfe) {
      throw new NotFoundException('NF-e não encontrada');
    }
    return toNfeStatusApiView(nfe);
  }
}
