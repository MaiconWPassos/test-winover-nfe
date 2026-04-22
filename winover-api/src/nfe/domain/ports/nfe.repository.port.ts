import type { DeepPartial } from 'typeorm';
import type { Nfe } from '../../entities/nfe.entity';
import type { NfeStatus } from '../../entities/nfe-status.enum';

export const NFE_REPOSITORY = Symbol('NFE_REPOSITORY');

export interface INfeRepository {
  create(entity: DeepPartial<Nfe>): Nfe;
  save(entity: Nfe): Promise<Nfe>;
  findById(id: string): Promise<Nfe | null>;
  nextNumero(): Promise<number>;
  findSummariesOrdered(limit: number): Promise<Nfe[]>;
  countByStatus(): Promise<Record<NfeStatus, number>>;
  countByDay(
    days: number,
    timeZone?: string,
  ): Promise<{ dia: string; quantidade: number }[]>;
  countTotal(): Promise<number>;
}
