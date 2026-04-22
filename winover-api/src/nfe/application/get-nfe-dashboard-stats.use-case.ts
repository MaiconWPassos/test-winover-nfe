import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NfeStatus } from '../entities/nfe-status.enum';
import {
  NFE_REPOSITORY,
  type INfeRepository,
} from '../domain/ports/nfe.repository.port';
import { toDashboardStatsView } from '../domain/mappers/nfe-api.mapper';

@Injectable()
export class GetNfeDashboardStatsUseCase {
  constructor(
    private readonly config: ConfigService,
    @Inject(NFE_REPOSITORY) private readonly nfeRepository: INfeRepository,
  ) {}

  async execute() {
    const statsTz =
      this.config.get<string>('STATS_TIMEZONE')?.trim() || 'America/Sao_Paulo';
    const [byStatus, byDay, total] = await Promise.all([
      this.nfeRepository.countByStatus(),
      this.nfeRepository.countByDay(30, statsTz),
      this.nfeRepository.countTotal(),
    ]);
    return toDashboardStatsView({ byStatus, byDay, total });
  }
}
