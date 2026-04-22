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

  create(dto: CreateNfeDto) {
    return this.createNfe.execute(dto);
  }

  getStatus(id: string) {
    return this.getNfeStatus.execute(id);
  }

  getAuthorizedXml(id: string) {
    return this.authorizedNfeXml.execute(id);
  }

  listSummaries(limit: number) {
    return this.listNfeSummaries.execute(limit);
  }

  getDashboardStats() {
    return this.nfeDashboardStats.execute();
  }
}
