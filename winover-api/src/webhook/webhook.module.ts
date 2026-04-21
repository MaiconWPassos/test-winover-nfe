import { Module } from '@nestjs/common';
import { NfeModule } from '../nfe/nfe.module';
import { WebhookSefazController } from './webhook-sefaz.controller';

@Module({
  imports: [NfeModule],
  controllers: [WebhookSefazController],
})
export class WebhookModule {}
