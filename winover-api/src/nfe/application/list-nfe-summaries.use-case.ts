import { Inject, Injectable } from '@nestjs/common';
import {
  NFE_REPOSITORY,
  type INfeRepository,
} from '../domain/ports/nfe.repository.port';
import { toNfeListSummaryView } from '../domain/mappers/nfe-api.mapper';

@Injectable()
export class ListNfeSummariesUseCase {
  constructor(
    @Inject(NFE_REPOSITORY) private readonly nfeRepository: INfeRepository,
  ) {}

  async execute(limit: number) {
    const take = Math.min(200, Math.max(1, limit));
    const rows = await this.nfeRepository.findSummariesOrdered(take);
    return rows.map((n) => toNfeListSummaryView(n));
  }
}
