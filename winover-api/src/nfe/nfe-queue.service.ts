import { Injectable, Logger } from '@nestjs/common';
import { NfeEmissionHandler } from './nfe-emission.handler';

/**
 * Fila assíncrona interna (simulação). Em produção, substitua por BullMQ, RabbitMQ, etc.
 */
@Injectable()
export class NfeQueueService {
  private readonly logger = new Logger(NfeQueueService.name);
  private readonly pending: string[] = [];
  private draining = false;

  constructor(private readonly emissionHandler: NfeEmissionHandler) {}

  enqueueEmission(nfeId: string): void {
    this.pending.push(nfeId);
    void this.drain();
  }

  private async drain(): Promise<void> {
    if (this.draining) {
      return;
    }
    this.draining = true;
    try {
      while (this.pending.length > 0) {
        const nfeId = this.pending.shift()!;
        try {
          await this.emissionHandler.handle(nfeId);
        } catch (err: unknown) {
          this.logger.error(
            {
              nfeId,
              err: err instanceof Error ? err.message : String(err),
            },
            'Falha ao processar job da fila interna',
          );
        }
      }
    } finally {
      this.draining = false;
      if (this.pending.length > 0) {
        void this.drain();
      }
    }
  }
}
