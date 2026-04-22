import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { NfeStatus } from '../entities/nfe-status.enum';
import { Nfe } from '../entities/nfe.entity';
import type { INfeRepository } from '../domain/ports/nfe.repository.port';

/** IANA seguro para `timezone()` no PostgreSQL (evita injeção em SQL dinâmico). */
function sanitizeStatsTimeZone(timeZone: string | undefined): string {
  const t = (timeZone ?? 'America/Sao_Paulo').trim();
  return /^[A-Za-z0-9_+-/]+$/.test(t) ? t : 'America/Sao_Paulo';
}

@Injectable()
export class NfeRepository implements INfeRepository {
  constructor(
    @InjectRepository(Nfe)
    private readonly repo: Repository<Nfe>,
  ) {}

  create(entity: DeepPartial<Nfe>): Nfe {
    return this.repo.create(entity);
  }

  save(entity: Nfe): Promise<Nfe> {
    return this.repo.save(entity);
  }

  findById(id: string): Promise<Nfe | null> {
    return this.repo.findOne({
      where: { id },
      relations: { customer: true, items: true },
    });
  }

  async nextNumero(): Promise<number> {
    const row = await this.repo
      .createQueryBuilder('nfe')
      .select('COALESCE(MAX(nfe.numero), 0)', 'max')
      .getRawOne<{ max: string }>();
    return Number(row?.max ?? 0) + 1;
  }

  /** Lista resumida sem `authorized_xml` (payload grande). */
  async findSummariesOrdered(limit: number): Promise<Nfe[]> {
    return this.repo
      .createQueryBuilder('nfe')
      .leftJoinAndSelect('nfe.customer', 'customer')
      .select([
        'nfe.id',
        'nfe.numero',
        'nfe.status',
        'nfe.createdAt',
        'nfe.updatedAt',
        'nfe.accessKey',
        'customer.id',
        'customer.cnpj',
        'customer.razaoSocial',
      ])
      .orderBy('nfe.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async countByStatus(): Promise<Record<NfeStatus, number>> {
    const rows = await this.repo
      .createQueryBuilder('nfe')
      .select('nfe.status', 'status')
      .addSelect('COUNT(*)', 'cnt')
      .groupBy('nfe.status')
      .getRawMany<{ status: NfeStatus; cnt: string }>();
    const out: Record<NfeStatus, number> = {
      [NfeStatus.PROCESSING]: 0,
      [NfeStatus.AUTHORIZED]: 0,
      [NfeStatus.REJECTED]: 0,
    };
    for (const r of rows) {
      out[r.status] = Number(r.cnt);
    }
    return out;
  }

  /**
   * Contagem por dia civil no fuso `timeZone` (IANA), últimos `days` dias
   * inclusive o dia atual nesse fuso — alinhado ao calendário local (ex.: Brasil).
   */
  async countByDay(
    days: number,
    timeZone?: string,
  ): Promise<{ dia: string; quantidade: number }[]> {
    const tz = sanitizeStatsTimeZone(timeZone);
    const daySpan = Math.max(0, days - 1);
    const rows = await this.repo
      .createQueryBuilder('nfe')
      .select(`to_char(timezone(:tz, nfe.created_at), 'YYYY-MM-DD')`, 'dia')
      .addSelect('COUNT(*)', 'cnt')
      .where(
        `(timezone(:tz, nfe.created_at))::date >= (CAST(timezone(:tz, CURRENT_TIMESTAMP) AS date) - CAST(:daySpan AS integer))`,
        { tz, daySpan },
      )
      .groupBy('dia')
      .orderBy('dia', 'ASC')
      .getRawMany<{ dia: string; cnt: string }>();
    return rows.map((r) => ({ dia: r.dia, quantidade: Number(r.cnt) }));
  }

  async countTotal(): Promise<number> {
    return this.repo.createQueryBuilder('nfe').getCount();
  }
}
