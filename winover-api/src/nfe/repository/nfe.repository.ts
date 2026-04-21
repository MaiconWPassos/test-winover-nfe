import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { NfeStatus } from '../entities/nfe-status.enum';
import { Nfe } from '../entities/nfe.entity';

@Injectable()
export class NfeRepository {
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

  /** Contagem por dia (UTC) nos últimos `days` dias, inclusive hoje. */
  async countByDayUtc(days: number): Promise<{ dia: string; quantidade: number }[]> {
    const from = new Date();
    from.setUTCHours(0, 0, 0, 0);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    const rows = await this.repo
      .createQueryBuilder('nfe')
      .select(`to_char((nfe.created_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD')`, 'dia')
      .addSelect('COUNT(*)', 'cnt')
      .where('nfe.created_at >= :from', { from })
      .groupBy('dia')
      .orderBy('dia', 'ASC')
      .getRawMany<{ dia: string; cnt: string }>();
    return rows.map((r) => ({ dia: r.dia, quantidade: Number(r.cnt) }));
  }

  async countTotal(): Promise<number> {
    return this.repo.createQueryBuilder('nfe').getCount();
  }
}
