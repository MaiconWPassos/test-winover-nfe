import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  async execute(userId: string) {
    const statsTz =
      this.config.get<string>('STATS_TIMEZONE')?.trim() || 'America/Sao_Paulo';
    const [byStatus, byDay, total] = await Promise.all([
      this.nfeRepository.countByStatusForUser(userId),
      this.nfeRepository.countByDay(userId, 30, statsTz),
      this.nfeRepository.countTotalForUser(userId),
    ]);
    return toDashboardStatsView({ byStatus, byDay, total });
  }
}
