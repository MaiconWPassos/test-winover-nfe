import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { setTimeout as delay } from 'node:timers/promises';

export type SefazResult =
  | { ok: true; protocol: string; receiptAt: string }
  | { ok: false; code: string; message: string };

/**
 * Simula webservice SEFAZ (homologação): envio síncrono e retorno de protocolo ou rejeição.
 */
@Injectable()
export class SefazMockService {
  private readonly logger = new Logger(SefazMockService.name);

  constructor(private readonly config: ConfigService) {}

  async enviarNfe(xml: string): Promise<SefazResult> {
    const ms = Number(this.config.get('SEFAZ_MOCK_DELAY_MS', '600'));
    await delay(Number.isFinite(ms) ? ms : 600);

    if (this.config.get('SEFAZ_FORCE_REJECT', 'false') === 'true') {
      this.logger.warn('SEFAZ_FORCE_REJECT ativo — simulando rejeição');
      return {
        ok: false,
        code: '999',
        message: 'Rejeição simulada (SEFAZ_FORCE_REJECT)',
      };
    }

    if (xml.includes('REJEITAR')) {
      return {
        ok: false,
        code: '215',
        message: 'Rejeição simulada: conteúdo marcado para rejeição (REJEITAR)',
      };
    }

    const protocol = `PROT${Date.now()}${Math.floor(Math.random() * 1e6)
      .toString()
      .padStart(6, '0')}`;
    const receiptAt = new Date().toISOString();
    this.logger.log({ protocol }, 'SEFAZ mock — NF-e autorizada');
    return { ok: true, protocol, receiptAt };
  }
}
