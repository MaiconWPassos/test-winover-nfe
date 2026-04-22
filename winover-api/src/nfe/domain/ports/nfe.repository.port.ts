import type { DeepPartial } from 'typeorm';
import type { Nfe } from '../../entities/nfe.entity';
import type { NfeStatus } from '../../entities/nfe-status.enum';

export const NFE_REPOSITORY = Symbol('NFE_REPOSITORY');

export interface INfeRepository {
  create(entity: DeepPartial<Nfe>): Nfe;
  save(entity: Nfe): Promise<Nfe>;
  findById(id: string): Promise<Nfe | null>;
  findByIdForUser(id: string, userId: string): Promise<Nfe | null>;
  nextNumero(): Promise<number>;
  findSummariesOrderedForUser(userId: string, limit: number): Promise<Nfe[]>;
  countByStatusForUser(userId: string): Promise<Record<NfeStatus, number>>;
  countByDay(
    userId: string,
    days: number,
    timeZone?: string,
  ): Promise<{ dia: string; quantidade: number }[]>;
  countTotalForUser(userId: string): Promise<number>;
}
