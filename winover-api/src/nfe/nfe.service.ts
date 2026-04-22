import { Injectable } from '@nestjs/common';
import type { CreateNfeDto } from './dto/create-nfe.dto';
import { CreateNfeUseCase } from './application/create-nfe.use-case';
import { GetAuthorizedNfeXmlUseCase } from './application/get-authorized-nfe-xml.use-case';
import { GetNfeDashboardStatsUseCase } from './application/get-nfe-dashboard-stats.use-case';
import { GetNfeStatusUseCase } from './application/get-nfe-status.use-case';
import { ListNfeSummariesUseCase } from './application/list-nfe-summaries.use-case';

/**
 * Fachada da camada de aplicação NF-e: expõe casos de uso ao controller
 * sem misturar orquestração com detalhes de persistência.
 */
@Injectable()
export class NfeService {
  constructor(
    private readonly createNfe: CreateNfeUseCase,
    private readonly getNfeStatus: GetNfeStatusUseCase,
    private readonly authorizedNfeXml: GetAuthorizedNfeXmlUseCase,
    private readonly listNfeSummaries: ListNfeSummariesUseCase,
    private readonly nfeDashboardStats: GetNfeDashboardStatsUseCase,
  ) {}

  create(userId: string, dto: CreateNfeDto) {
    return this.createNfe.execute(userId, dto);
  }

  getStatus(userId: string, id: string) {
    return this.getNfeStatus.execute(userId, id);
  }

  getAuthorizedXml(userId: string, id: string) {
    return this.authorizedNfeXml.execute(userId, id);
  }

  listSummaries(userId: string, limit: number) {
    return this.listNfeSummaries.execute(userId, limit);
  }

  getDashboardStats(userId: string) {
    return this.nfeDashboardStats.execute(userId);
  }
}
