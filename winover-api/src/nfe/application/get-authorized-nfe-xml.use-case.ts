import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NfeStatus } from '../entities/nfe-status.enum';
import {
  NFE_REPOSITORY,
  type INfeRepository,
} from '../domain/ports/nfe.repository.port';

@Injectable()
export class GetAuthorizedNfeXmlUseCase {
  constructor(
    @Inject(NFE_REPOSITORY) private readonly nfeRepository: INfeRepository,
  ) {}

  async execute(id: string): Promise<string> {
    const nfe = await this.nfeRepository.findById(id);
    if (!nfe) {
      throw new NotFoundException('NF-e não encontrada');
    }
    if (nfe.status !== NfeStatus.AUTHORIZED || !nfe.authorizedXml) {
      throw new NotFoundException('XML disponível apenas para NF-e autorizada');
    }
    return nfe.authorizedXml;
  }
}
